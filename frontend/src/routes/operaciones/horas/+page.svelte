<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { addNotificacion } from '$lib/stores.js';
	import { conductorService } from '$lib/api/services.js';
	import { puedeAccion, puedeVerModulo } from '$lib/permisos.js';
	import { modulosConfig } from '$lib/modulos.js';

	const MODULO = 'registroHoras';
	let puedeRegistrar = false;
	let conductores = [];
	let loadingConductores = true;
	let detalle = null;
	let loadingDetalle = false;
	let selectedId = '';
	let fatigaInfo = null; // { hasta: Date, activa: boolean, nombre: string }
	let fatigasActivas = [];
	let fatigasDerivadas = [];
	let loadingFatigas = true;
	let ticker = 0;
	let form = {
		fecha: new Date().toISOString().slice(0, 10),
		hora_inicio: '',
		hora_fin: '',
		observaciones: ''
	};
	let horasPreview = '0.00 h';

	$: permisosModulo = $modulosConfig;
	$: { permisosModulo; puedeRegistrar = puedeAccion(MODULO, 'crear'); }
	$: ticker; // fuerza reactividad para countdowns

	onMount(() => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Registro de Horas', 'error');
			goto('/');
			return;
		}

		const tickInterval = setInterval(() => (ticker = Date.now()), 1000 * 30);
		const fatigaInterval = setInterval(() => cargarFatigas(), 1000 * 60);

		(async () => {
			await Promise.all([cargarConductores(), cargarFatigas()]);
		})();

		return () => {
			clearInterval(tickInterval);
			clearInterval(fatigaInterval);
		};
	});
	async function cargarConductores() {
		loadingConductores = true;
		try {
			const data = await conductorService.listar();
			conductores = (data.conductores || []).map((c) => ({ ...c, id_conductor: String(c.id_conductor) }));
			// No preseleccionar para no bloquear el flujo de creación
			selectedId = '';
			detalle = null;
		} catch (error) {
			addNotificacion(error.message, 'error');
		} finally {
			loadingConductores = false;
		}
	}

	async function cargarFatigas() {
		loadingFatigas = true;
		try {
			const resp = await conductorService.listarFatigaActiva();
			fatigasActivas = resp?.conductores || [];
		} catch (error) {
			addNotificacion(error.message, 'error');
		} finally {
			loadingFatigas = false;
		}
	}

	async function cargarDetalle(id) {
		if (!id) {
			detalle = null;
			fatigaInfo = null;
			return;
		}
		loadingDetalle = true;
		try {
			detalle = await conductorService.obtenerDetalles(id);
			fatigaInfo = deriveFatiga(detalle);
		} catch (error) {
			const message = (error?.message || '').toLowerCase();
			const sinHistorial =
				message.includes('no hay registro') ||
				message.includes('no existen registros') ||
				message.includes('no se encontraron registros');
			if (sinHistorial) {
				detalle = { horas_conduccion: [] };
				fatigaInfo = null;
			} else {
				addNotificacion(error.message, 'error');
				detalle = null;
				fatigaInfo = null;
			}
		} finally {
			loadingDetalle = false;
		}
	}

	function deriveFatiga(det) {
		if (!det || !det.horas_conduccion || det.horas_conduccion.length === 0) return null;
		const last = det.horas_conduccion[0];
		const threshold = parseFloat(import.meta.env.VITE_FATIGA_THRESHOLD_HORAS) || 8;
		const horas = parseFloat(last.horas_manejadas || 0);
		if (!Number.isFinite(horas) || horas <= threshold) return null;
		const fechaBase = (last.fecha || '').split('T')[0];
		const hasta = fechaBase ? new Date(`${fechaBase}T${last.hora_fin}`) : new Date(`${last.fecha} ${last.hora_fin}`);
		hasta.setHours(hasta.getHours() + 6);
		if (hasta <= new Date()) return null;
		return { hasta, activa: true, nombre: det.conductor?.nombre };
	}

	function parseHoraToMinutes(hora) {
		if (!hora) return null;
		const [h, m] = hora.split(':').map((v) => Number(v));
		if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
		return h * 60 + m;
	}

	function diffHoras(horaInicio, horaFin) {
		const inicioMin = parseHoraToMinutes(horaInicio);
		const finMin = parseHoraToMinutes(horaFin);
		if (inicioMin === null || finMin === null) return 0;
		const diff = finMin - inicioMin;
		return diff > 0 ? diff / 60 : 0;
	}

	// Actualiza el preview cada vez que cambian las horas (deps explícitas para reactividad)
	$: horasPreview = `${diffHoras(form.hora_inicio, form.hora_fin).toFixed(2)} h`;

	function handleConductorChange(event) {
		const target = /** @type {HTMLSelectElement} */ (event.target);
		const value = target?.value || '';
		selectedId = value;
		if (value) {
			cargarDetalle(value);
		} else {
			detalle = null;
			fatigaInfo = null;
		}
	}

	function fmtCountdown(hasta, nowMs) {
		if (!hasta) return '—';
		const diff = new Date(hasta).getTime() - (nowMs || Date.now());
		if (diff <= 0) return 'Disponible';
		const h = Math.floor(diff / (1000 * 60 * 60));
		const m = Math.floor((diff / (1000 * 60)) % 60);
		return `${h}h ${m}m`;
	}

	function calcProgresoFatiga(f, nowMs) {
		const inicio = f?.descanso_inicio ? new Date(f.descanso_inicio) : null;
		const hasta = f?.descanso_hasta ? new Date(f.descanso_hasta) : null;
		if (!inicio || !hasta || hasta <= inicio) return { pct: 0, restante: '—', totalHoras: '6.0' };
		const totalMs = hasta.getTime() - inicio.getTime();
		const restanteMs = Math.max(hasta.getTime() - (nowMs || Date.now()), 0);
		const pct = Math.min(100, Math.max(0, ((totalMs - restanteMs) / totalMs) * 100));
		const totalHoras = (totalMs / (1000 * 60 * 60)).toFixed(1);
		return { pct, restante: fmtCountdown(hasta, nowMs), totalHoras };
	}

	$: fatigasDerivadas = fatigasActivas.map((f) => ({ ...f, progreso: calcProgresoFatiga(f, ticker) }));

	async function registrarHoras() {
		if (!puedeRegistrar) {
			addNotificacion('No tienes permisos para registrar horas', 'error');
			return;
		}
		if (!selectedId) {
			addNotificacion('Selecciona un conductor', 'warning');
			return;
		}
		if (!form.fecha || !form.hora_inicio || !form.hora_fin) {
			addNotificacion('Completa fecha y horas', 'warning');
			return;
		}
		const horas = diffHoras(form.hora_inicio, form.hora_fin);
		if (horas <= 0) {
			addNotificacion('La hora fin debe ser mayor a la hora inicio', 'warning');
			return;
		}
		try {
			const resp = await conductorService.registrarHoras(selectedId, {
				fecha: form.fecha,
				hora_inicio: form.hora_inicio,
				hora_fin: form.hora_fin,
				horas_manejadas: horas,
				observaciones: form.observaciones || null
			});
			addNotificacion('Horas registradas', 'success');
			form = { fecha: new Date().toISOString().slice(0, 10), hora_inicio: '', hora_fin: '', observaciones: '' };
			if (resp?.descanso_hasta) {
				fatigaInfo = { hasta: new Date(resp.descanso_hasta), activa: resp.fatiga_activa, nombre: conductores.find((c) => c.id_conductor === selectedId)?.nombre };
			} else {
				fatigaInfo = null;
			}
			await Promise.all([cargarDetalle(selectedId), cargarFatigas()]);
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}
</script>

<svelte:head>
	<title>Registro de Horas - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Operaciones</p>
			<h1>Registro de Horas</h1>
			<p class="lede">Carga rápida de horas de conducción por conductor y fecha.</p>
			<div class="chips">
				<span class="chip success">{conductores.length} conductores</span>
				{#if detalle}
					<span class="chip muted">Último registro: {detalle.horas_conduccion?.[0]?.fecha || '—'}</span>
				{/if}
			</div>
		</div>
	</section>

	<section class="panel">
		<div class="panel-head">
			<div>
				<p class="label">Fatiga activa</p>
				<h2>Conductores bloqueados</h2>
			</div>
		</div>

		{#if loadingFatigas}
			<div class="loading">
				<div class="spinner"></div>
				<p>Calculando fatiga...</p>
			</div>
		{:else if !fatigasDerivadas.length}
			<div class="empty">
				<p>No hay conductores en ventana de descanso.</p>
			</div>
		{:else}
			<div class="fatiga-grid">
				{#each fatigasDerivadas as f (f.id_conductor)}
					{@const ringPct = Math.max(1, Math.min(100, f.progreso?.pct || 0))}
					<article class="fatiga-card">
						<div class="fatiga-card__head">
							<div>
								<p class="label">Fatiga activa</p>
								<h3>{f.nombre}</h3>
								<p class="lede">Descansando hasta {new Date(f.descanso_hasta).toLocaleString()}</p>
							</div>
							<div class="pill danger-pill">Bloqueado</div>
						</div>
						<div class="fatiga-card__body">
							<div
								class="radial"
								style={`--pct:${ringPct}; --ring-color: var(--tc-accent-2); --ring-track: color-mix(in srgb, var(--tc-border), var(--tc-bg) 60%);`}
							>
								<span>{Math.round(f.progreso?.pct || 0)}%</span>
							</div>
							<div class="fatiga-card__meta">
								<p class="lede">Restante {f.progreso?.restante}</p>
								<p class="muted">Ventana {f.progreso?.totalHoras || '6.0'}h • Día {Number(f.total_horas_dia || 0).toFixed(2)}h</p>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>

	<section class="panel">
		<div class="panel-head">
			<div>
				<p class="label">Formulario</p>
				<h2>Registrar horas</h2>
			</div>
		</div>
		<div class="form-grid">
			<label class="field">
				<span>Conductor</span>
				<select bind:value={selectedId} on:change={handleConductorChange} disabled={loadingConductores}>
					{#if loadingConductores}
						<option>Cargando...</option>
					{:else if conductores.length === 0}
						<option>No hay conductores</option>
					{:else}
						<option value="">Seleccionar conductor</option>
						{#each conductores as c}
							<option value={c.id_conductor}>{c.nombre} - {c.cedula}</option>
						{/each}
					{/if}
				</select>
			</label>
			<label class="field">
				<span>Fecha</span>
				<input type="date" bind:value={form.fecha} />
			</label>
			<label class="field">
				<span>Hora inicio</span>
				<input type="time" bind:value={form.hora_inicio} />
			</label>
			<label class="field">
				<span>Hora fin</span>
				<input type="time" bind:value={form.hora_fin} />
			</label>
			<label class="field">
				<span>Horas calculadas</span>
				<input type="text" value={horasPreview} readonly />
			</label>
			<label class="field full">
				<span>Observaciones</span>
				<textarea rows="3" placeholder="Notas u observaciones" bind:value={form.observaciones}></textarea>
			</label>
			<div class="form-actions">
				<button class="primary" on:click={registrarHoras} disabled={!puedeRegistrar}>Registrar</button>
			</div>
		</div>
	</section>

	<section class="panel">
		<div class="panel-head">
			<div>
				<p class="label">Histórico</p>
				<h2>Últimos registros</h2>
			</div>
		</div>

		{#if !selectedId}
			<div class="empty">
				<p>Selecciona un conductor para ver su historial.</p>
			</div>
		{:else if loadingDetalle}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando registros...</p>
			</div>
		{:else if !detalle || !detalle.horas_conduccion || detalle.horas_conduccion.length === 0}
			<div class="empty">
				<p>Aún no hay registros de horas para este conductor. Registra horas para ver su historial aquí.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Fecha</th>
							<th>Inicio</th>
							<th>Fin</th>
							<th>Horas</th>
							<th>Observaciones</th>
						</tr>
					</thead>
					<tbody>
						{#each detalle.horas_conduccion.slice(0, 10) as h}
							<tr>
								<td>{h.fecha}</td>
								<td>{h.hora_inicio}</td>
								<td>{h.hora_fin}</td>
								<td>{h.horas_manejadas}</td>
								<td>{h.observaciones || '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>

<style>
	.page-shell { position: relative; padding: 22px 20px 60px 20px; font-family: var(--tc-font); color: var(--tc-text); }
	.bg-shape { position: absolute; border-radius: 999px; filter: blur(90px); opacity: 0.26; z-index: 0; }
	.shape-a { width: 420px; height: 420px; background: color-mix(in srgb, var(--tc-accent), transparent 78%); top: -140px; left: -120px; }
	.shape-b { width: 360px; height: 360px; background: color-mix(in srgb, var(--tc-accent-2), transparent 80%); bottom: -160px; right: -120px; }
	:global(html[data-theme='dark']) .page-shell .bg-shape { opacity: 0.18; }

	.hero { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: center; background: linear-gradient(125deg, var(--tc-surface) 0%, var(--tc-surface-2) 100%); border: 1px solid var(--tc-border); border-radius: 16px; padding: 18px 20px; box-shadow: var(--tc-shadow); margin-bottom: 16px; }
	.hero-text h1 { margin: 6px 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
	.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: var(--tc-accent-2); font-weight: 800; margin: 0; }
	.lede { margin: 0; color: var(--tc-text-muted); font-size: 14px; max-width: 540px; }
	.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
	.chip { padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; border: 1px solid var(--tc-border-strong); background: var(--tc-surface-3); color: var(--tc-accent-2); }
	.chip.muted { background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 40%); border-color: var(--tc-border); color: var(--tc-text-muted); }
	.chip.success { background: var(--tc-success-bg); border-color: var(--tc-success-border); color: var(--tc-success-text); }

	.panel { position: relative; z-index: 1; background: var(--tc-surface); border-radius: 16px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); padding: 18px 18px 22px 18px; margin-bottom: 16px; }
	.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: var(--tc-text-muted); margin: 0; font-weight: 800; }
	.panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: var(--tc-text); min-width: 0; }
	.field input, .field select, .field textarea { padding: 12px 12px; border-radius: 12px; border: 1.5px solid var(--tc-border); background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%); font-size: 14px; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; font-family: inherit; min-width: 0; }
	.field select { text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
	.field textarea { resize: vertical; }
	.field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: var(--tc-accent); box-shadow: 0 10px 30px color-mix(in srgb, var(--tc-accent), transparent 85%); background: var(--tc-surface); }
	.field.full { grid-column: 1 / -1; }
	.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px; }

	.fatiga-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
	@media (min-width: 1200px) { .fatiga-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
	.fatiga-card { border: 1px solid var(--tc-border); border-radius: 12px; padding: 10px; background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%); box-shadow: var(--tc-shadow); display: flex; flex-direction: column; gap: 8px; min-height: 140px; }
	.fatiga-card__head { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
	.fatiga-card__head h3 { margin: 2px 0; font-size: 15px; }
	.fatiga-card__body { display: flex; gap: 10px; align-items: center; }
	.fatiga-card__meta { display: grid; gap: 2px; font-size: 13px; }
	.fatiga-card__meta .muted { color: var(--tc-text-muted); font-size: 12px; }
	.radial { width: 78px; height: 78px; border-radius: 50%; position: relative; display: grid; place-items: center; background: conic-gradient(var(--ring-color, var(--tc-accent-2)) calc(var(--pct, 0) * 1%), var(--ring-track, color-mix(in srgb, var(--tc-border), var(--tc-bg) 70%)) 0); border: 1px solid var(--tc-border); transition: background 0.2s ease; }
	.radial::after { content: ''; position: absolute; inset: 10px; border-radius: 50%; background: var(--tc-surface); border: 1px solid var(--tc-border); }
	.radial span { position: relative; font-weight: 800; color: var(--ring-color, var(--tc-accent-2)); font-size: 14px; }

	.panel.fatiga { border-color: var(--tc-danger-border); background: color-mix(in srgb, var(--tc-danger-bg), var(--tc-surface) 30%); }
	.fatiga-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.danger-pill, .pill.danger-pill { background: var(--tc-danger-bg); color: var(--tc-danger-text); border: 1px solid var(--tc-danger-border); border-radius: 999px; padding: 8px 12px; font-weight: 800; font-size: 13px; }
	.fatiga-count { margin-top: 10px; display: flex; gap: 8px; align-items: baseline; font-size: 14px; }

	.primary { background: linear-gradient(135deg, var(--tc-accent), var(--tc-accent-2)); color: var(--tc-on-accent); border: 1px solid color-mix(in srgb, var(--tc-accent), var(--tc-border) 55%); border-radius: 12px; padding: 10px 14px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 26px color-mix(in srgb, var(--tc-accent), transparent 75%); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.primary:hover { transform: translateY(-1px); box-shadow: 0 16px 30px color-mix(in srgb, var(--tc-accent), transparent 70%); }
	.primary:active { transform: translateY(0); box-shadow: 0 10px 22px color-mix(in srgb, var(--tc-accent), transparent 78%); }

	.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); margin-top: 10px; }
	table { width: 100%; border-collapse: collapse; font-size: 14px; }
	thead { background: var(--tc-surface-2); }
	thead th { text-align: left; padding: 14px; font-weight: 800; color: var(--tc-text); border-bottom: 1px solid var(--tc-border); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
	tbody td { padding: 14px; border-bottom: 1px solid color-mix(in srgb, var(--tc-border), transparent 40%); color: var(--tc-text); }
	tbody tr:hover { background: color-mix(in srgb, var(--tc-accent), var(--tc-surface) 92%); }

	.loading, .empty { display: grid; place-items: center; gap: 10px; padding: 40px; color: var(--tc-text-muted); }
	.spinner { width: 32px; height: 32px; border-radius: 50%; border: 4px solid color-mix(in srgb, var(--tc-accent), transparent 82%); border-top-color: var(--tc-accent); animation: spin 0.8s linear infinite; }
	@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }

	@media (max-width: 720px) {
		.hero { flex-direction: column; align-items: flex-start; }
		.panel { padding: 16px; }
		thead { display: none; }
		table, tbody, tr, td { display: block; width: 100%; }
		tbody tr { margin-bottom: 12px; border: 1px solid var(--tc-border); border-radius: 12px; padding: 10px; }
		tbody td { border: none; padding: 8px 4px; }
	}
</style>
