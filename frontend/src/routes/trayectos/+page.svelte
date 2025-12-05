<script>
	import { onMount } from 'svelte';
	import { trayectos, addNotificacion } from '$lib/stores.js';
	import { trayectoService } from '$lib/api/services.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let formData = { origen: '', destino: '', distancia_km: '', tiempo_estimado: '', estado: 'disponible' };

	onMount(async () => {
		await cargarTrayectos();
	});

	async function cargarTrayectos() {
		trayectos.update(t => ({ ...t, loading: true }));
		try {
			const data = await trayectoService.listar();
			trayectos.update(t => ({ ...t, items: data.trayectos || [], loading: false }));
		} catch (error) {
			trayectos.update(t => ({ ...t, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function abrirFormulario() {
		editandoId = null;
		formData = { origen: '', destino: '', distancia_km: '', tiempo_estimado: '', estado: 'disponible' };
		mostrarFormulario = true;
	}

	function editarTrayecto(trayecto) {
		editandoId = trayecto.id_trayecto;
		formData = {
			origen: trayecto.origen,
			destino: trayecto.destino,
			distancia_km: trayecto.distancia_km,
			tiempo_estimado: trayecto.tiempo_estimado,
			estado: trayecto.estado
		};
		mostrarFormulario = true;
	}

	async function guardarTrayecto() {
		if (!formData.origen || !formData.destino || !formData.distancia_km || !formData.tiempo_estimado) {
			addNotificacion('Completa todos los campos', 'warning');
			return;
		}
		try {
			if (editandoId) {
				await trayectoService.actualizar(editandoId, formData);
				addNotificacion('Trayecto actualizado', 'success');
			} else {
				await trayectoService.crear(formData);
				addNotificacion('Trayecto creado', 'success');
			}
			mostrarFormulario = false;
			await cargarTrayectos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function eliminarTrayecto(id) {
		if (confirm('¿Eliminar este trayecto?')) {
			try {
				await trayectoService.eliminar(id);
				addNotificacion('Trayecto eliminado', 'success');
				await cargarTrayectos();
			} catch (error) {
				addNotificacion(error.message, 'error');
			}
		}
	}
</script>

<svelte:head>
	<title>Gestión de Trayectos - TransConecta</title>
</svelte:head>

<div class="container">
	<div class="header">
		<div>
			<h1>🗺️ Gestión de Trayectos</h1>
			<p class="subtitle">Crea rutas, asigna vehículos y conductores con seguimiento en tiempo real</p>
		</div>
		<button class="btn btn-primary" on:click={abrirFormulario}>+ Nuevo Trayecto</button>
	</div>

	{#if mostrarFormulario}
		<div class="form-card">
			<h2>{editandoId ? 'Editar' : 'Crear'} Trayecto</h2>
			<form on:submit|preventDefault={guardarTrayecto}>
				<div class="form-group">
					<label for="origen">Origen</label>
					<input id="origen" type="text" placeholder="Ciudad origen" bind:value={formData.origen} required />
				</div>
				<div class="form-group">
					<label for="destino">Destino</label>
					<input id="destino" type="text" placeholder="Ciudad destino" bind:value={formData.destino} required />
				</div>
				<div class="form-group">
					<label for="distancia">Distancia (km)</label>
					<input id="distancia" type="number" placeholder="0" bind:value={formData.distancia_km} required />
				</div>
				<div class="form-group">
					<label for="tiempo">Tiempo Estimado (horas)</label>
					<input id="tiempo" type="number" placeholder="0" step="0.5" bind:value={formData.tiempo_estimado} required />
				</div>
				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Guardar</button>
					<button type="button" class="btn btn-secondary" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</div>
	{/if}

	{#if $trayectos.loading}
		<div class="loading">Cargando trayectos...</div>
	{:else if $trayectos.items.length === 0}
		<div class="empty-state">
			<p>No hay trayectos registrados</p>
		</div>
	{:else}
		<div class="table-responsive">
			<table>
				<thead>
					<tr>
						<th>Origen</th>
						<th>Destino</th>
						<th>Distancia</th>
						<th>Tiempo</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each $trayectos.items as route}
						<tr>
							<td>{route.origen}</td>
							<td>{route.destino}</td>
							<td>{route.distancia_km} km</td>
							<td>{route.tiempo_estimado} h</td>
							<td>
								<span class="status" class:disponible={route.estado === 'disponible'} class:en_uso={route.estado === 'en_uso'}>
									{route.estado}
								</span>
							</td>
							<td>
								<button class="btn-action btn-edit" on:click={() => editarTrayecto(route)}>✏️</button>
								<button class="btn-action btn-danger" on:click={() => eliminarTrayecto(route.id_trayecto)}>🗑️</button>
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
	form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
	.form-group { display: flex; flex-direction: column; gap: 6px; }
	.form-group label { font-weight: 500; color: #2d3748; font-size: 14px; }
	.form-group input, .form-group select { padding: 10px 12px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px; font-family: inherit; }
	.form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; }
	.table-responsive { background: white; border-radius: 8px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
	table { width: 100%; border-collapse: collapse; }
	th { background: #f7fafc; padding: 16px; text-align: left; font-weight: 600; color: #2d3748; border-bottom: 2px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
	td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px; }
	tr:hover { background: #f7fafc; }
	.status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
	.status.disponible { background: #c6f6d5; color: #22543d; }
	.status.en_uso { background: #bee3f8; color: #2c5282; }
	.btn-action { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 4px; transition: all 0.2s; }
	.btn-edit { background: #bee3f8; color: #2c5282; }
	.btn-edit:hover { background: #90cdf4; }
	.btn-danger { background: #fed7d7; color: #742a2a; }
	.btn-danger:hover { background: #fc8181; }
	.loading { text-align: center; padding: 40px; color: #718096; font-size: 16px; }
	.empty-state { background: white; border-radius: 8px; padding: 60px 20px; text-align: center; color: #718096; font-size: 16px; }
</style>
