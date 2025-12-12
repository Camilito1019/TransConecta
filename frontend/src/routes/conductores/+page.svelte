<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { conductores, addNotificacion } from '$lib/stores.js';
	import { conductorService } from '$lib/api/services.js';
	import { puedeCrear, puedeEditar, puedeEliminar, puedeCambiarEstado, puedeVerModulo } from '$lib/permisos.js';
	import { modulosConfig } from '$lib/modulos.js';
	import { estadoLabel, estadoClass } from '$lib/status.js';
	import { scrollToTop } from '$lib/scroll.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let confirmAction = { open: false, type: null, id: null, label: '' };
	let detalleModal = { open: false, data: null, loading: false };
	let formData = {
		nombre: '',
		cedula: '',
		telefono: '',
		licencia_conduccion: '',
		estado: 'activo'
	};

	const MODULO = 'conductores';

	let puedeCrearConductores = false;
	let puedeEditarConductores = false;
	let puedeEliminarConductores = false;
	let puedeCambiarEstadoConductores = false;

	$: permisosModulo = $modulosConfig;
	$: {
		permisosModulo;
		puedeCrearConductores = puedeCrear(MODULO);
		puedeEditarConductores = puedeEditar(MODULO);
		puedeEliminarConductores = puedeEliminar(MODULO);
		puedeCambiarEstadoConductores = puedeCambiarEstado(MODULO);
	}

	const fmtDateTime = (value) => {
		if (!value) return '—';
		const d = new Date(value);
		const t = d.getTime();
		return Number.isNaN(t) ? value : d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
	};

	const fmtDate = (value) => {
		if (!value) return '—';
		const d = new Date(value);
		const t = d.getTime();
		return Number.isNaN(t) ? value : d.toLocaleDateString('es-CO', { dateStyle: 'medium' });
	};

	const fmtTime = (value) => (value ? value.toString().slice(0, 8) : '');

	onMount(async () => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Conductores', 'error');
			goto('/');
			return;
		}
		await cargarConductores();
	});

	async function verConductor(conductor) {
		detalleModal = { open: true, data: null, loading: true };
		try {
			const data = await conductorService.obtenerDetalles(conductor.id_conductor);
			detalleModal = { open: true, data, loading: false };
		} catch (error) {
			addNotificacion('No se pudo cargar el detalle', 'error');
			detalleModal = { open: false, data: null, loading: false };
		}
	}

	async function cargarConductores() {
		conductores.update((c) => ({ ...c, loading: true }));
		try {
			const data = await conductorService.listar();
			conductores.update((c) => ({ ...c, items: data.conductores || [], loading: false }));
		} catch (error) {
			conductores.update((c) => ({ ...c, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function resetForm() {
		editandoId = null;
		formData = {
			nombre: '',
			cedula: '',
			telefono: '',
			licencia_conduccion: '',
			estado: 'activo'
		};
	}

	async function abrirFormulario() {
		resetForm();
		mostrarFormulario = true;
		await tick();
		scrollToTop();
	}

	async function editarConductor(conductor) {
		editandoId = conductor.id_conductor;
		formData = {
			nombre: conductor.nombre || '',
			cedula: conductor.cedula || '',
			telefono: conductor.telefono || '',
			licencia_conduccion: conductor.licencia_conduccion || '',
			estado: conductor.estado || 'activo'
		};
		mostrarFormulario = true;
		await tick();
		scrollToTop();
	}

	async function guardarConductor() {
		if (!formData.nombre || !formData.cedula) {
			addNotificacion('Completa nombre y cédula', 'warning');
			return;
		}
		try {
			if (editandoId) {
				await conductorService.actualizar(editandoId, formData);
				addNotificacion('Conductor actualizado', 'success');
			} else {
				await conductorService.crear(formData);
				addNotificacion('Conductor creado', 'success');
			}
			mostrarFormulario = false;
			await cargarConductores();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	function solicitarAccion(type, conductor) {
		confirmAction = {
			open: true,
			type,
			id: conductor.id_conductor,
			label: conductor.nombre
		};
	}

	async function confirmarAccion() {
		if (!confirmAction.id || !confirmAction.type) return;
		try {
			if (confirmAction.type === 'eliminar') {
				await conductorService.eliminar(confirmAction.id);
				addNotificacion('Conductor eliminado', 'success');
			} else if (confirmAction.type === 'desactivar') {
				await conductorService.desactivar(confirmAction.id);
				addNotificacion('Conductor desactivado', 'success');
			} else if (confirmAction.type === 'activar') {
				await conductorService.activar(confirmAction.id);
				addNotificacion('Conductor activado', 'success');
			}
			confirmAction = { open: false, type: null, id: null, label: '' };
			await cargarConductores();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	$: stats = {
		total: $conductores.items.length,
		activos: $conductores.items.filter((c) => c.estado === 'activo').length,
		inactivos: $conductores.items.filter((c) => c.estado === 'inactivo').length
	};
</script>

<svelte:head>
	<title>Gestión de Conductores - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Operaciones</p>
			<h1>Gestión de Conductores</h1>
			<p class="lede">Administra conductores, licencias y estado operativo.</p>
			<div class="chips">
				<span class="chip success">{stats.activos} activos</span>
				<span class="chip muted">{stats.inactivos} inactivos</span>
			</div>
		</div>
		<div class="hero-actions">
			{#if puedeCrearConductores}
				<button class="primary" on:click={abrirFormulario}>+ Nuevo conductor</button>
			{/if}
		</div>
	</section>

	{#if mostrarFormulario}
		<section class="panel">
			<div class="panel-head">
				<div>
					<p class="label">Formulario</p>
					<h2>{editandoId ? 'Editar conductor' : 'Nuevo conductor'}</h2>
				</div>
				<button class="ghost" on:click={() => (mostrarFormulario = false)}>Cerrar</button>
			</div>
			<form class="form-grid" on:submit|preventDefault={guardarConductor}>
				<label class="field">
					<span>Nombre</span>
					<input type="text" placeholder="Juan Pérez" bind:value={formData.nombre} required />
				</label>
				<label class="field">
					<span>Cédula</span>
					<input type="text" placeholder="1234567890" bind:value={formData.cedula} required />
				</label>
				<label class="field">
					<span>Teléfono</span>
					<input type="text" placeholder="3001234567" bind:value={formData.telefono} />
				</label>
				<label class="field">
					<span>Licencia</span>
					<input type="text" placeholder="LIC-123456" bind:value={formData.licencia_conduccion} />
				</label>
				<label class="field">
					<span>Estado</span>
					<select bind:value={formData.estado}>
						<option value="activo">Activo</option>
						<option value="inactivo">Inactivo</option>
					</select>
				</label>
				<div class="form-actions">
					<button type="submit" class="primary">Guardar</button>
					<button type="button" class="ghost" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</section>
	{/if}

	<section class="panel">
		<div class="panel-head">
			<div>
				<p class="label">Listado</p>
				<h2>Conductores</h2>
			</div>
		</div>

		{#if $conductores.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando conductores...</p>
			</div>
		{:else if $conductores.items.length === 0}
			<div class="empty">
				<p>No hay conductores registrados.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Cédula</th>
							<th>Teléfono</th>
							<th>Licencia</th>
							<th>Estado</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $conductores.items as c}
							<tr>
								<td>{c.nombre}</td>
								<td>{c.cedula}</td>
								<td>{c.telefono || '—'}</td>
								<td>{c.licencia_conduccion || '—'}</td>
								<td>
									<span class={`status-pill status-${estadoClass(c.estado)}`}>
										{estadoLabel(c.estado)}
									</span>
							</td>
							<td class="actions">
									<button class="ghost" on:click={() => verConductor(c)}>Ver</button>
								{#if puedeEditarConductores}
									<button class="ghost" on:click={() => editarConductor(c)}>Editar</button>
								{/if}
								{#if puedeCambiarEstadoConductores}
									{#if c.estado === 'inactivo'}
										<button class="success" on:click={() => solicitarAccion('activar', c)}>Activar</button>
									{:else}
										<button class="danger" on:click={() => solicitarAccion('desactivar', c)}>Desactivar</button>
									{/if}
								{/if}
								{#if puedeEliminarConductores}
									<button class="outline" on:click={() => solicitarAccion('eliminar', c)}>Eliminar</button>
								{/if}
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	{#if confirmAction.open}
		<div class="modal-backdrop">
			<div class="modal">
				<p class="label">Confirmar</p>
				<h3>
					{confirmAction.type === 'eliminar'
						? '¿Eliminar conductor?'
						: confirmAction.type === 'desactivar'
						? '¿Desactivar conductor?'
						: '¿Activar conductor?'}
				</h3>
				<p class="lede">
					{confirmAction.type === 'eliminar'
						? 'Se eliminará '
						: confirmAction.type === 'desactivar'
						? 'Se marcará inactivo '
						: 'Se marcará activo '}
					<strong>{confirmAction.label}</strong>.
				</p>
				<div class="modal-actions">
					<button class="ghost" on:click={() => (confirmAction = { open: false, type: null, id: null, label: '' })}>Cancelar</button>
					<button class="danger" on:click={confirmarAccion}>Confirmar</button>
				</div>
			</div>
		</div>
	{/if}

	{#if detalleModal.open}
		<div class="modal-backdrop">
			<div class="modal wide">
				<p class="label">Detalle de conductor</p>
				{#if detalleModal.loading}
					<p class="lede">Cargando...</p>
				{:else if detalleModal.data}
					<h3>{detalleModal.data.conductor?.nombre || 'Conductor'}</h3>
					<p class="lede small">
						Cédula: {detalleModal.data.conductor?.cedula} • Teléfono: {detalleModal.data.conductor?.telefono || '—'} • Licencia: {detalleModal.data.conductor?.licencia_conduccion || '—'}
					</p>
					<div class="detail-scroll">
						<div class="detail-grid top-row">
							<div class="card">
								<div class="card-head">
									<h4>Horas de conducción</h4>
									<span class="pill">{Math.min(detalleModal.data.horas_conduccion?.length || 0, 5)} / {detalleModal.data.total_horas}</span>
								</div>
								{#if detalleModal.data.horas_conduccion?.length}
									<div class="list-scroll">
										<ul class="lined">
											{#each (detalleModal.data.horas_conduccion || []).slice(0,5) as h}
												<li>
													<div>
														<strong>{fmtDate(h.fecha)}</strong> • {fmtTime(h.hora_inicio)} - {fmtTime(h.hora_fin)} ({h.horas_manejadas} h)
													</div>
													{#if h.observaciones}<span class="muted">{h.observaciones}</span>{/if}
												</li>
											{/each}
										</ul>
									</div>
								{:else}
									<p class="muted">Sin registros</p>
								{/if}
							</div>
							<div class="card">
								<div class="card-head">
									<h4>Alertas de fatiga</h4>
									<span class="pill warning">{Math.min(detalleModal.data.alertas?.length || 0, 5)} / {detalleModal.data.total_alertas}</span>
								</div>
								{#if detalleModal.data.alertas?.length}
									<div class="list-scroll">
										<ul class="lined">
											{#each (detalleModal.data.alertas || []).slice(0,5) as a}
												<li>
													<strong>{fmtDateTime(a.fecha_alerta)}</strong> • {a.descripcion}
												</li>
											{/each}
										</ul>
									</div>
								{:else}
									<p class="muted">Sin alertas</p>
								{/if}
							</div>
						</div>
						<div class="card full wide">
							<div class="card-head">
								<h4>Historial</h4>
								<span class="pill muted-pill">{Math.min(detalleModal.data.historial?.length || 0, 5)} / {detalleModal.data.total_eventos}</span>
							</div>
							{#if detalleModal.data.historial?.length}
								<div class="list-scroll">
									<ul class="lined">
										{#each (detalleModal.data.historial || []).slice(0,5) as e}
											<li>
												<strong>{fmtDateTime(e.fecha_evento)}</strong> • {e.evento}
											</li>
										{/each}
									</ul>
								</div>
							{:else}
								<p class="muted">Sin historial</p>
							{/if}
						</div>
					</div>
				{/if}
				<div class="modal-actions">
					<button class="ghost" on:click={() => (detalleModal = { open: false, data: null, loading: false })}>Cerrar</button>
				</div>
			</div>
		</div>
	{/if}
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

	.hero-actions { display: flex; gap: 10px; }
	.primary { background: linear-gradient(135deg, var(--tc-accent), var(--tc-accent-2)); color: var(--tc-on-accent); border: 1px solid color-mix(in srgb, var(--tc-accent), var(--tc-border) 55%); border-radius: 12px; padding: 10px 14px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 26px color-mix(in srgb, var(--tc-accent), transparent 75%); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.primary:hover { transform: translateY(-1px); box-shadow: 0 16px 30px color-mix(in srgb, var(--tc-accent), transparent 70%); }
	.primary:active { transform: translateY(0); box-shadow: 0 10px 22px color-mix(in srgb, var(--tc-accent), transparent 78%); }

	.panel { position: relative; z-index: 1; background: var(--tc-surface); border-radius: 16px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); padding: 18px 18px 22px 18px; margin-bottom: 16px; }
	.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: var(--tc-text-muted); margin: 0; font-weight: 800; }
	.panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

	.ghost, .outline, .success, .danger { border-radius: 12px; padding: 10px 12px; font-weight: 700; cursor: pointer; border: 1px solid var(--tc-border); background: var(--tc-surface); color: var(--tc-accent-2); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.ghost:hover, .outline:hover, .success:hover, .danger:hover { transform: translateY(-1px); }
	.outline { color: var(--tc-text); border-color: var(--tc-border-strong); }
	.success { color: var(--tc-success-text); border-color: var(--tc-success-border); background: var(--tc-success-bg); }
	.danger { color: var(--tc-danger-text); border-color: var(--tc-danger-border); background: var(--tc-danger-bg); }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: var(--tc-text); }
	.field input, .field select { padding: 12px 12px; border-radius: 12px; border: 1.5px solid var(--tc-border); background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%); font-size: 14px; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; font-family: inherit; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--tc-accent); box-shadow: 0 10px 30px color-mix(in srgb, var(--tc-accent), transparent 85%); background: var(--tc-surface); }
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; }

	.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); }
	table { width: 100%; border-collapse: collapse; font-size: 14px; }
	thead { background: var(--tc-surface-2); }
	thead th { text-align: left; padding: 14px; font-weight: 800; color: var(--tc-text); border-bottom: 1px solid var(--tc-border); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
	tbody td { padding: 14px; border-bottom: 1px solid color-mix(in srgb, var(--tc-border), transparent 40%); color: var(--tc-text); }
	tbody tr:hover { background: color-mix(in srgb, var(--tc-accent), var(--tc-surface) 92%); }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
	.status { padding: 6px 10px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: capitalize; border: 1px solid transparent; }
	.status.green { background: var(--tc-success-bg); color: var(--tc-success-text); border-color: var(--tc-success-border); }
	.status.red { background: var(--tc-danger-bg); color: var(--tc-danger-text); border-color: var(--tc-danger-border); }

	.loading, .empty { display: grid; place-items: center; gap: 10px; padding: 40px; color: var(--tc-text-muted); }
	.spinner { width: 32px; height: 32px; border-radius: 50%; border: 4px solid color-mix(in srgb, var(--tc-accent), transparent 82%); border-top-color: var(--tc-accent); animation: spin 0.8s linear infinite; }
	@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }

	.modal-backdrop { position: fixed; inset: 0; background: var(--tc-backdrop); backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 20; }
	.modal { width: min(440px, 92%); background: var(--tc-surface); border-radius: 18px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow-strong); padding: 18px 18px 16px; display: grid; gap: 10px; }
	.modal.wide { width: min(900px, 95%); }
	.modal h3 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
	.modal .lede { margin: 0; color: var(--tc-text-muted); font-size: 14px; }
	.modal .lede.small { font-size: 13px; color: color-mix(in srgb, var(--tc-text-muted), transparent 15%); }
	.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
	.detail-scroll { max-height: 70vh; overflow-y: auto; padding-right: 6px; }
	.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
	.detail-grid.top-row { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
	.card { background: linear-gradient(145deg, var(--tc-surface), color-mix(in srgb, var(--tc-surface-2), var(--tc-surface) 65%)); border: 1px solid var(--tc-border); border-radius: 14px; padding: 12px; box-shadow: var(--tc-shadow); display: grid; gap: 8px; }
	.card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
	.card h4 { margin: 0; font-size: 15px; font-weight: 800; }
	.card ul { margin: 0; padding-left: 16px; display: grid; gap: 6px; font-size: 13px; }
	.lined li { padding: 6px 0; border-bottom: 1px dashed color-mix(in srgb, var(--tc-border), transparent 35%); }
	.lined li:last-child { border-bottom: none; }
	.list-scroll { max-height: 190px; overflow-y: auto; padding-right: 6px; }
	.pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; background: color-mix(in srgb, var(--tc-accent), var(--tc-surface) 92%); color: var(--tc-accent-2); font-weight: 700; font-size: 12px; border: 1px solid color-mix(in srgb, var(--tc-accent), var(--tc-border) 60%); }
	.pill.warning { background: var(--tc-warning-bg); color: var(--tc-warning-text); border: 1px solid var(--tc-warning-border); }
	.pill.muted-pill { background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 40%); color: var(--tc-text-muted); border: 1px solid var(--tc-border); }
	.muted { color: var(--tc-text-muted); }

	@media (max-width: 720px) {
		.hero { flex-direction: column; align-items: flex-start; }
		.panel { padding: 16px; }
		thead { display: none; }
		table, tbody, tr, td { display: block; width: 100%; }
		tbody tr { margin-bottom: 12px; border: 1px solid var(--tc-border); border-radius: 12px; padding: 10px; }
		tbody td { border: none; padding: 8px 4px; }
		tbody td:last-child { padding-top: 8px; }
	}
</style>
