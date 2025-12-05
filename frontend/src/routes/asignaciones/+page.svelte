<script>
	import { onMount } from 'svelte';
	import { asignaciones, addNotificacion, vehiculos, conductores, trayectos } from '$lib/stores.js';
	import { trayectoService, vehiculoService, conductorService } from '$lib/api/services.js';

	let mostrarFormulario = false;
	let formData = { vehiculoId: '', conductorId: '', trayectoId: '' };

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
			vehiculos.update(v => ({ ...v, items: vehRes.vehiculos || [] }));
			conductores.update(c => ({ ...c, items: condRes.conductores || [] }));
			trayectos.update(t => ({ ...t, items: trayRes.trayectos || [] }));

			asignaciones.update(a => ({ ...a, loading: true }));
			const asigRes = await trayectoService.listarAsignaciones();
			asignaciones.update(a => ({ ...a, items: asigRes.asignaciones || [], loading: false }));
		} catch (error) {
			asignaciones.update(a => ({ ...a, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	async function guardarAsignacion() {
		if (!formData.vehiculoId || !formData.conductorId || !formData.trayectoId) {
			addNotificacion('Completa todos los campos', 'warning');
			return;
		}
		try {
			await trayectoService.asignarTrayecto(formData.vehiculoId, formData.conductorId, formData.trayectoId);
			addNotificacion('Asignación creada', 'success');
			formData = { vehiculoId: '', conductorId: '', trayectoId: '' };
			mostrarFormulario = false;
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function desasignarTrayecto(id) {
		if (confirm('¿Desasignar este trayecto?')) {
			try {
				await trayectoService.desasignarTrayecto(id);
				addNotificacion('Asignación eliminada', 'success');
				await cargarDatos();
			} catch (error) {
				addNotificacion(error.message, 'error');
			}
		}
	}
</script>

<svelte:head>
	<title>Gestión de Asignaciones - TransConecta</title>
</svelte:head>

<div class="container">
	<div class="header">
		<div>
			<h1>📍 Gestión de Asignaciones</h1>
			<p class="subtitle">Coordina la asignación de trayectos a vehículos y conductores</p>
		</div>
		<button class="btn btn-primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
			{mostrarFormulario ? '✕' : '+ Nueva Asignación'}
		</button>
	</div>

	{#if mostrarFormulario}
		<div class="form-card">
			<h2>Crear Nueva Asignación</h2>
			<form on:submit|preventDefault={guardarAsignacion}>
				<div class="form-group">
					<label for="vehiculo">Vehículo</label>
					<select id="vehiculo" bind:value={formData.vehiculoId} required>
						<option value="">Seleccionar vehículo</option>
						{#each $vehiculos.items as v}
							<option value={v.id_vehiculo}>{v.placa} - {v.marca} {v.modelo}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="conductor">Conductor</label>
					<select id="conductor" bind:value={formData.conductorId} required>
						<option value="">Seleccionar conductor</option>
						{#each $conductores.items as c}
							<option value={c.id_conductor}>{c.nombre} {c.apellido}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="trayecto">Trayecto</label>
					<select id="trayecto" bind:value={formData.trayectoId} required>
						<option value="">Seleccionar trayecto</option>
						{#each $trayectos.items as t}
							<option value={t.id_trayecto}>{t.origen} → {t.destino}</option>
						{/each}
					</select>
				</div>
				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Asignar</button>
					<button type="button" class="btn btn-secondary" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</div>
	{/if}

	{#if $asignaciones.loading}
		<div class="loading">Cargando asignaciones...</div>
	{:else if $asignaciones.items.length === 0}
		<div class="empty-state">
			<p>No hay asignaciones registradas</p>
		</div>
	{:else}
		<div class="table-responsive">
			<table>
				<thead>
					<tr>
						<th>Vehículo</th>
						<th>Conductor</th>
						<th>Trayecto</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each $asignaciones.items as asign}
						<tr>
							<td><strong>{asign.vehiculo_placa || 'N/A'}</strong></td>
							<td>{asign.conductor_nombre || 'N/A'}</td>
							<td>{asign.trayecto_origen} → {asign.trayecto_destino}</td>
							<td>
								<span class="badge" class:en_uso={asign.estado === 'en_uso'} class:disponible={asign.estado === 'disponible'}>
									{asign.estado}
								</span>
							</td>
							<td>
								<button class="btn-action btn-danger" on:click={() => desasignarTrayecto(asign.id)}>🗑️ Desasignar</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.container { width: 100%; padding: 20px; box-sizing: border-box; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; gap: 20px; }
	.header h1 { margin: 0; font-size: 28px; color: #1a202c; }
	.subtitle { margin: 8px 0 0 0; color: #718096; font-size: 14px; }
	.btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s; }
	.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
	.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4); }
	.btn-secondary { background: #e2e8f0; color: #2d3748; }
	.btn-secondary:hover { background: #cbd5e0; }
	.form-card { background: white; border-radius: 8px; padding: 24px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
	.form-card h2 { margin: 0 0 20px 0; color: #1a202c; }
	form { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
	.form-group { display: flex; flex-direction: column; gap: 6px; }
	.form-group label { font-weight: 500; color: #2d3748; font-size: 14px; }
	.form-group select { padding: 10px 12px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px; font-family: inherit; }
	.form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; }
	.table-responsive { background: white; border-radius: 8px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
	table { width: 100%; border-collapse: collapse; }
	th { background: #f7fafc; padding: 16px; text-align: left; font-weight: 600; color: #2d3748; border-bottom: 2px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
	td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px; }
	tr:hover { background: #f7fafc; }
	.badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
	.badge.en_uso { background: #bee3f8; color: #2c5282; }
	.badge.disponible { background: #c6f6d5; color: #22543d; }
	.btn-action { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
	.btn-danger { background: #fed7d7; color: #742a2a; }
	.btn-danger:hover { background: #fc8181; }
	.loading { text-align: center; padding: 40px; color: #718096; font-size: 16px; }
	.empty-state { background: white; border-radius: 8px; padding: 60px 20px; text-align: center; color: #718096; font-size: 16px; }
</style>
