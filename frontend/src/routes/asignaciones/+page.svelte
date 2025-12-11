<script>
	import { onMount } from 'svelte';
	import { asignaciones, addNotificacion, vehiculos, conductores, trayectos } from '$lib/stores.js';
	import { trayectoService, vehiculoService, conductorService } from '$lib/api/services.js';
	import { puedeCrear, puedeEditar, puedeEliminar } from '$lib/permisos.js';

	let mostrarFormulario = false;
	let confirmAction = { open: false, id: null, label: '' };
	let editingId = null;
	let formData = { id_vehiculo: '', id_conductor: '', id_trayecto: '' };

	// Permisos
	$: puedeCrearAsignaciones = puedeCrear();
	$: puedeEditarAsignaciones = puedeEditar();
	$: puedeEliminarAsignaciones = puedeEliminar();

	onMount(async () => {
		await cargarDatos();
	});

	async function cargarDatos() {
		try {
			const [vehRes, condRes, trayRes] = await Promise.all([
				vehiculoService.listar(),
				conductorService.listar(),
				trayectoService.listar()
			]);
			vehiculos.update((v) => ({ ...v, items: vehRes.vehiculos || [] }));
			conductores.update((c) => ({ ...c, items: condRes.conductores || [] }));
			trayectos.update((t) => ({ ...t, items: trayRes.trayectos || [] }));

			asignaciones.update((a) => ({ ...a, loading: true }));
			const asigRes = await trayectoService.listarAsignaciones();
			asignaciones.update((a) => ({ ...a, items: asigRes.asignaciones || [], loading: false }));
		} catch (error) {
			asignaciones.update((a) => ({ ...a, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	async function guardarAsignacion() {
		if (!formData.id_vehiculo || !formData.id_conductor || !formData.id_trayecto) {
			addNotificacion('Completa todos los campos', 'warning');
			return;
		}
		const payload = {
			id_vehiculo: Number(formData.id_vehiculo),
			id_conductor: Number(formData.id_conductor),
			id_trayecto: Number(formData.id_trayecto)
		};
		try {
			if (editingId) {
				await trayectoService.actualizarAsignacion(editingId, payload);
				addNotificacion('Asignación actualizada', 'success');
			} else {
				await trayectoService.asignarTrayecto(payload);
				addNotificacion('Asignación creada', 'success');
			}
			formData = { id_vehiculo: '', id_conductor: '', id_trayecto: '' };
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
			id_trayecto: asign.id_trayecto?.toString() || ''
		};
		mostrarFormulario = true;
	}

	function cancelarEdicion() {
		formData = { id_vehiculo: '', id_conductor: '', id_trayecto: '' };
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
	@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

	.page-shell { position: relative; padding: 22px 20px 60px 20px; font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1f1f1f; }
	.bg-shape { position: absolute; border-radius: 999px; filter: blur(90px); opacity: 0.32; z-index: 0; }
	.shape-a { width: 420px; height: 420px; background: #f6c3c3; top: -140px; left: -120px; }
	.shape-b { width: 360px; height: 360px; background: #ffd8cf; bottom: -160px; right: -120px; }

	.hero { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: center; background: linear-gradient(125deg, #ffffff 0%, #fff4f2 100%); border: 1px solid #f0d8d3; border-radius: 16px; padding: 18px 20px; box-shadow: 0 12px 36px rgba(0,0,0,0.06); margin-bottom: 16px; }
	.hero-text h1 { margin: 6px 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
	.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: #a33b36; font-weight: 800; margin: 0; }
	.lede { margin: 0; color: #4f4f4f; font-size: 14px; max-width: 540px; }
	.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
	.chip { padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; border: 1px solid #f4d5d2; background: #fff1f1; color: #a33b36; }
	.chip.muted { background: #fafafa; border-color: #ededed; color: #3f3f46; }
	.chip.success { background: #f2fcf6; border-color: #cce8d8; color: #1d5a39; }

	.hero-actions { display: flex; gap: 10px; }
	.primary { background: linear-gradient(135deg, #e3473c, #c23630); color: #fff; border: 1px solid #f4d5d2; border-radius: 12px; padding: 10px 14px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 26px rgba(227,71,60,0.25); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.primary:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(227,71,60,0.3); }
	.primary:active { transform: translateY(0); box-shadow: 0 10px 22px rgba(227,71,60,0.22); }

	.panel { position: relative; z-index: 1; background: #fff; border-radius: 16px; border: 1px solid #f1f1f1; box-shadow: 0 14px 40px rgba(0,0,0,0.04); padding: 18px 18px 22px 18px; margin-bottom: 16px; }
	.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: #9a9a9a; margin: 0; font-weight: 800; }
	.panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

	.ghost, .outline, .danger {
		border-radius: 12px;
		padding: 10px 12px;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid #f0d0cb;
		background: #fff;
		color: #a33b36;
		transition: transform 0.12s ease, box-shadow 0.18s ease;
	}
	.ghost:hover, .outline:hover, .danger:hover { transform: translateY(-1px); }
	.outline { color: #4a4a4a; border-color: #e6e6e6; }
	.danger { background: #fff1f1; }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: #3f3f46; }
	.field select {
		padding: 12px 12px;
		border-radius: 12px;
		border: 1.5px solid #e6e6e9;
		background: #fbfbfc;
		font-size: 14px;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
		font-family: inherit;
	}
	.field select:focus {
		outline: none;
		border-color: #e3473c;
		box-shadow: 0 10px 30px rgba(227, 71, 60, 0.12);
		background: #fff;
	}
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; justify-content: flex-end; }

	.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid #f1f1f1; box-shadow: 0 12px 32px rgba(0,0,0,0.04); }
	table { width: 100%; border-collapse: collapse; font-size: 14px; }
	thead { background: #fff8f6; }
	thead th { text-align: left; padding: 14px; font-weight: 800; color: #2a2a2a; border-bottom: 1px solid #f0d8d3; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
	tbody td { padding: 14px; border-bottom: 1px solid #f5f5f5; color: #3f3f46; }
	tbody tr:hover { background: #fff4f2; }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

	.loading, .empty { display: grid; place-items: center; gap: 10px; padding: 40px; color: #4a4a4a; }
	.spinner { width: 32px; height: 32px; border-radius: 50%; border: 4px solid #ffe0db; border-top-color: #e3473c; animation: spin 0.8s linear infinite; }
	@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }

	.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 20; }
	.modal { width: min(420px, 92%); background: #fff; border-radius: 16px; border: 1px solid #f0d8d3; box-shadow: 0 24px 60px rgba(0,0,0,0.12); padding: 18px 18px 16px; display: grid; gap: 10px; }
	.modal h3 { margin: 0; font-size: 20px; font-weight: 800; }
	.modal .lede { margin: 0; color: #4f4f4f; font-size: 14px; }
	.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

	@media (max-width: 720px) {
		.hero { flex-direction: column; align-items: flex-start; }
		.panel { padding: 16px; }
		thead { display: none; }
		table, tbody, tr, td { display: block; width: 100%; }
		tbody tr { margin-bottom: 12px; border: 1px solid #f1f1f1; border-radius: 12px; padding: 10px; }
		tbody td { border: none; padding: 8px 4px; }
	}
</style>
