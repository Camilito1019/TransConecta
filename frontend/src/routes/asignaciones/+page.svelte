<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { asignaciones, addNotificacion, vehiculos, conductores, trayectos, clientes } from '$lib/stores.js';
	import { trayectoService, vehiculoService, conductorService, clienteService } from '$lib/api/services.js';
	import { puedeCrear, puedeEditar, puedeEliminar, puedeVerModulo, puedeAccion } from '$lib/permisos.js';
	import { modulosConfig } from '$lib/modulos.js';

	let mostrarFormulario = false;
	let confirmAction = { open: false, id: null, label: '' };
	let editingId = null;
	let formData = { id_vehiculo: '', id_conductor: '', id_trayecto: '', id_cliente: '' };

	const MODULO = 'asignaciones';

	let puedeCrearAsignaciones = false;
	let puedeEditarAsignaciones = false;
	let puedeEliminarAsignaciones = false;

	$: permisosModulo = $modulosConfig;
	$: {
		permisosModulo;
		puedeCrearAsignaciones = puedeCrear(MODULO);
		puedeEditarAsignaciones = puedeEditar(MODULO);
		puedeEliminarAsignaciones = puedeEliminar(MODULO);
	}

	onMount(async () => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Asignaciones', 'error');
			goto('/');
			return;
		}
		await cargarDatos();
	});

	async function cargarDatos() {
		try {
			const puedeVerVehiculos = puedeAccion('vehiculos', 'ver');
			const puedeVerConductores = puedeAccion('conductores', 'ver');
			const puedeVerTrayectos = puedeAccion('trayectos', 'ver');
			const puedeVerClientes = puedeAccion('clientes', 'ver');

			// Inicializar stores vacíos cuando no hay permiso (evita datos stale)
			if (!puedeVerVehiculos) vehiculos.update((v) => ({ ...v, items: [] }));
			if (!puedeVerConductores) conductores.update((c) => ({ ...c, items: [] }));
			if (!puedeVerTrayectos) trayectos.update((t) => ({ ...t, items: [] }));
			if (!puedeVerClientes) clientes.update((c) => ({ ...c, items: [] }));

			const tareas = [];
			if (puedeVerVehiculos) {
				tareas.push(
					vehiculoService.listar().then((vehRes) => {
						vehiculos.update((v) => ({ ...v, items: vehRes.vehiculos || [] }));
					})
				);
			}
			if (puedeVerConductores) {
				tareas.push(
					conductorService.listar().then((condRes) => {
						conductores.update((c) => ({ ...c, items: condRes.conductores || [] }));
					})
				);
			}
			if (puedeVerTrayectos) {
				tareas.push(
					trayectoService.listar().then((trayRes) => {
						trayectos.update((t) => ({ ...t, items: trayRes.trayectos || [] }));
					})
				);
			}
			if (puedeVerClientes) {
				tareas.push(
					clienteService.listar().then((cliRes) => {
						clientes.update((c) => ({ ...c, items: cliRes.clientes || [] }));
					})
				);
			}

			const resultados = await Promise.allSettled(tareas);
			const fallos = resultados.filter((r) => r.status === 'rejected');
			if (fallos.length) {
				// No bloquear toda la pantalla por permisos parciales; mostrar una advertencia.
				console.warn('Algunos catálogos no se pudieron cargar (permisos o error):', fallos);
				addNotificacion('Algunos catálogos no se pudieron cargar por permisos.', 'warning');
			}

			asignaciones.update((a) => ({ ...a, loading: true }));
			const asigRes = await trayectoService.listarAsignaciones();
			asignaciones.update((a) => ({ ...a, items: asigRes.asignaciones || [], loading: false }));
		} catch (error) {
			asignaciones.update((a) => ({ ...a, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	async function guardarAsignacion() {
		if (!formData.id_vehiculo || !formData.id_conductor || !formData.id_trayecto || !formData.id_cliente) {
			addNotificacion('Completa todos los campos', 'warning');
			return;
		}
		const payload = {
			id_vehiculo: Number(formData.id_vehiculo),
			id_conductor: Number(formData.id_conductor),
			id_trayecto: Number(formData.id_trayecto),
			id_cliente: Number(formData.id_cliente)
		};
		try {
			if (editingId) {
				await trayectoService.actualizarAsignacion(editingId, payload);
				addNotificacion('Asignación actualizada', 'success');
			} else {
				await trayectoService.asignarTrayecto(payload);
				addNotificacion('Asignación creada', 'success');
			}
			formData = { id_vehiculo: '', id_conductor: '', id_trayecto: '', id_cliente: '' };
			editingId = null;
			mostrarFormulario = false;
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	function editarAsignacion(asign) {
		editingId = asign.id_asignacion || asign.id;
		formData = {
			id_vehiculo: asign.id_vehiculo?.toString() || '',
			id_conductor: asign.id_conductor?.toString() || '',
			id_trayecto: asign.id_trayecto?.toString() || '',
			id_cliente: asign.id_cliente?.toString() || ''
		};
		mostrarFormulario = true;
	}

	function cancelarEdicion() {
			formData = { id_vehiculo: '', id_conductor: '', id_trayecto: '', id_cliente: '' };
		editingId = null;
		mostrarFormulario = false;
	}

	function solicitarEliminar(asign) {
		confirmAction = {
			open: true,
			id: asign.id_asignacion || asign.id,
			label: `${asign.vehiculo_placa || 'Vehículo'} → ${asign.trayecto_destino || ''}`
		};
	}

	async function confirmarEliminar() {
		if (!confirmAction.id) return;
		try {
			await trayectoService.desasignarTrayecto(confirmAction.id);
			addNotificacion('Asignación eliminada', 'success');
			confirmAction = { open: false, id: null, label: '' };
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	$: stats = {
		total: $asignaciones.items.length,
		vehiculos: new Set($asignaciones.items.map((a) => a.id_vehiculo)).size
	};
</script>

<svelte:head>
	<title>Gestión de Asignaciones - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Operaciones</p>
			<h1>Gestión de Asignaciones</h1>
			<p class="lede">Coordina rutas, vehículos y conductores con control visual.</p>
			<div class="chips">
				<span class="chip success">{stats.total} asignaciones</span>
				<span class="chip muted">{stats.vehiculos} vehículos</span>
			</div>
		</div>
		<div class="hero-actions">
			{#if puedeCrearAsignaciones || puedeEditarAsignaciones}
				{#if editingId}
					<button class="ghost" on:click={cancelarEdicion}>Cancelar edición</button>
				{/if}
				{#if (editingId && puedeEditarAsignaciones) || (!editingId && puedeCrearAsignaciones)}
					<button class="primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
						{mostrarFormulario ? 'Cerrar' : editingId ? 'Editar asignación' : '+ Nueva asignación'}
					</button>
				{/if}
			{/if}
		</div>
	</section>

	{#if mostrarFormulario}
		<section class="panel">
			<div class="panel-head">
				<div>
					<p class="label">Formulario</p>
					<h2>{editingId ? 'Editar asignación' : 'Crear asignación'}</h2>
				</div>
				<button class="ghost" on:click={cancelarEdicion}>Cerrar</button>
			</div>
			<form class="form-grid" on:submit|preventDefault={guardarAsignacion}>
				<label class="field">
					<span>Vehículo</span>
					<select bind:value={formData.id_vehiculo}>
						<option value="">Seleccionar</option>
						{#each $vehiculos.items as v}
							<option value={String(v.id_vehiculo)}>{v.placa} · {v.marca} {v.modelo}</option>
						{/each}
					</select>
				</label>
				<label class="field">
					<span>Conductor</span>
					<select bind:value={formData.id_conductor}>
						<option value="">Seleccionar</option>
						{#each $conductores.items as c}
							<option value={String(c.id_conductor)}>{c.nombre} ({c.cedula})</option>
						{/each}
					</select>
				</label>
				<label class="field">
					<span>Cliente</span>
					<select bind:value={formData.id_cliente}>
						<option value="">Seleccionar</option>
						{#each $clientes.items as cli}
							<option value={String(cli.id_cliente)}>{cli.nombre}</option>
						{/each}
					</select>
				</label>
				<label class="field">
					<span>Trayecto</span>
					<select bind:value={formData.id_trayecto}>
						<option value="">Seleccionar</option>
						{#each $trayectos.items as t}
							<option value={String(t.id_trayecto)}>{t.origen} → {t.destino} ({t.distancia_km} km)</option>
						{/each}
					</select>
				</label>
				<div class="form-actions">
					<button type="submit" class="primary">{editingId ? 'Guardar cambios' : 'Asignar'}</button>
					<button type="button" class="ghost" on:click={cancelarEdicion}>Cancelar</button>
				</div>
			</form>
		</section>
	{/if}

	<section class="panel">
		<div class="panel-head">
			<div>
				<p class="label">Listado</p>
				<h2>Asignaciones</h2>
			</div>
		</div>

		{#if $asignaciones.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando asignaciones...</p>
			</div>
		{:else if $asignaciones.items.length === 0}
			<div class="empty">
				<p>No hay asignaciones registradas.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Vehículo</th>
							<th>Conductor</th>
							<th>Cliente</th>
							<th>Trayecto</th>
							<th>Fecha</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $asignaciones.items as a}
							<tr>
								<td>{a.vehiculo_placa || '—'} · {a.vehiculo_marca || ''} {a.vehiculo_modelo || ''}</td>
								<td>{a.conductor_nombre || '—'} ({a.conductor_cedula || '—'})</td>
								<td>{a.cliente_nombre || '—'}</td>
								<td>{a.trayecto_origen || '—'} → {a.trayecto_destino || '—'}</td>
								<td>{a.fecha_asignacion ? a.fecha_asignacion.substring(0, 10) : '—'}</td>
								<td class="actions">
									{#if puedeEditarAsignaciones}
										<button class="outline" on:click={() => editarAsignacion(a)}>Editar</button>
									{/if}
									{#if puedeEliminarAsignaciones}
										<button class="danger" on:click={() => solicitarEliminar(a)}>Desasignar</button>
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
				<h3>¿Desasignar ruta?</h3>
				<p class="lede">Se liberará <strong>{confirmAction.label}</strong>.</p>
				<div class="modal-actions">
					<button class="ghost" on:click={() => (confirmAction = { open: false, id: null, label: '' })}>Cancelar</button>
					<button class="danger" on:click={confirmarEliminar}>Confirmar</button>
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

	.ghost, .outline, .danger { border-radius: 12px; padding: 10px 12px; font-weight: 700; cursor: pointer; border: 1px solid var(--tc-border); background: var(--tc-surface); color: var(--tc-accent-2); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.ghost:hover, .outline:hover, .danger:hover { transform: translateY(-1px); }
	.outline { color: var(--tc-text); border-color: var(--tc-border-strong); }
	.danger { color: var(--tc-danger-text); border-color: var(--tc-danger-border); background: var(--tc-danger-bg); }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: var(--tc-text); min-width: 0; }
	.field select { width: 100%; min-width: 0; padding: 12px 12px; border-radius: 12px; border: 1.5px solid var(--tc-border); background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%); font-size: 14px; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; font-family: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.field select:focus { outline: none; border-color: var(--tc-accent); box-shadow: 0 10px 30px color-mix(in srgb, var(--tc-accent), transparent 85%); background: var(--tc-surface); }
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; justify-content: flex-end; }

	.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); }
	table { width: 100%; border-collapse: collapse; font-size: 14px; }
	thead { background: var(--tc-surface-2); }
	thead th { text-align: left; padding: 14px; font-weight: 800; color: var(--tc-text); border-bottom: 1px solid var(--tc-border); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
	tbody td { padding: 14px; border-bottom: 1px solid color-mix(in srgb, var(--tc-border), transparent 40%); color: var(--tc-text); }
	tbody tr:hover { background: color-mix(in srgb, var(--tc-accent), var(--tc-surface) 92%); }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

	.loading, .empty { display: grid; place-items: center; gap: 10px; padding: 40px; color: var(--tc-text-muted); }
	.spinner { width: 32px; height: 32px; border-radius: 50%; border: 4px solid color-mix(in srgb, var(--tc-accent), transparent 82%); border-top-color: var(--tc-accent); animation: spin 0.8s linear infinite; }
	@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }

	.modal-backdrop { position: fixed; inset: 0; background: var(--tc-backdrop); backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 20; }
	.modal { width: min(420px, 92%); background: var(--tc-surface); border-radius: 16px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow-strong); padding: 18px 18px 16px; display: grid; gap: 10px; }
	.modal h3 { margin: 0; font-size: 20px; font-weight: 800; }
	.modal .lede { margin: 0; color: var(--tc-text-muted); font-size: 14px; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

	@media (max-width: 720px) {
		.hero { flex-direction: column; align-items: flex-start; }
		.panel { padding: 16px; }
		thead { display: none; }
		table, tbody, tr, td { display: block; width: 100%; }
		tbody tr { margin-bottom: 12px; border: 1px solid var(--tc-border); border-radius: 12px; padding: 10px; }
		tbody td { border: none; padding: 8px 4px; }
	}
</style>
