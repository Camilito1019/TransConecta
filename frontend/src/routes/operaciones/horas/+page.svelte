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
	let form = {
		fecha: new Date().toISOString().slice(0, 10),
		hora_inicio: '',
		hora_fin: '',
		observaciones: ''
	};

	$: permisosModulo = $modulosConfig;
	$: { permisosModulo; puedeRegistrar = puedeAccion(MODULO, 'crear'); }

	onMount(async () => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Registro de Horas', 'error');
			goto('/');
			return;
		}
		await cargarConductores();
	});

	async function cargarConductores() {
		loadingConductores = true;
		try {
			const data = await conductorService.listar();
			conductores = data.conductores || [];
			if (conductores.length > 0) {
				selectedId = conductores[0].id_conductor;
				await cargarDetalle(selectedId);
			}
		} catch (error) {
			addNotificacion(error.message, 'error');
		} finally {
			loadingConductores = false;
		}
	}

	async function cargarDetalle(id) {
		if (!id) return;
		loadingDetalle = true;
		try {
			detalle = await conductorService.obtenerDetalles(id);
		} catch (error) {
			addNotificacion(error.message, 'error');
		} finally {
			loadingDetalle = false;
		}
	}

	function diffHoras() {
		if (!form.fecha || !form.hora_inicio || !form.hora_fin) return 0;
		const inicio = new Date(`${form.fecha}T${form.hora_inicio}`);
		const fin = new Date(`${form.fecha}T${form.hora_fin}`);
		const diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
		return Number.isFinite(diff) ? Math.max(diff, 0) : 0;
	}

	function handleConductorChange(event) {
		const target = /** @type {HTMLSelectElement} */ (event.target);
		const value = target?.value || '';
		selectedId = value;
		cargarDetalle(value);
	}

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
		const horas = diffHoras();
		if (horas <= 0) {
			addNotificacion('La hora fin debe ser mayor a la hora inicio', 'warning');
			return;
		}
		try {
			await conductorService.registrarHoras(selectedId, {
				fecha: form.fecha,
				hora_inicio: form.hora_inicio,
				hora_fin: form.hora_fin,
				horas_manejadas: horas,
				observaciones: form.observaciones || null
			});
			addNotificacion('Horas registradas', 'success');
			form = { fecha: new Date().toISOString().slice(0, 10), hora_inicio: '', hora_fin: '', observaciones: '' };
			await cargarDetalle(selectedId);
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
				<input type="text" value={`${diffHoras().toFixed(2)} h`} readonly />
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

		{#if loadingDetalle}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando registros...</p>
			</div>
		{:else if !detalle || !detalle.horas_conduccion || detalle.horas_conduccion.length === 0}
			<div class="empty">
				<p>No hay registros de horas para este conductor.</p>
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

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: var(--tc-text); }
	.field input, .field select, .field textarea { padding: 12px 12px; border-radius: 12px; border: 1.5px solid var(--tc-border); background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%); font-size: 14px; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; font-family: inherit; }
	.field textarea { resize: vertical; }
	.field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: var(--tc-accent); box-shadow: 0 10px 30px color-mix(in srgb, var(--tc-accent), transparent 85%); background: var(--tc-surface); }
	.field.full { grid-column: 1 / -1; }
	.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px; }

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
