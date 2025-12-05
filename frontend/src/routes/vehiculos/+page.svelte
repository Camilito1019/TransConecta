<script>
	import { onMount } from 'svelte';
	import { vehiculos, addNotificacion } from '$lib/stores.js';
	import { vehiculoService } from '$lib/api/services.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let formData = {
		placa: '',
		modelo: '',
		marca: '',
		año: '',
		capacidad_carga: '',
		estado_operativo: 'operativo'
	};

	onMount(async () => {
		await cargarVehiculos();
	});

	async function cargarVehiculos() {
		vehiculos.update(v => ({ ...v, loading: true }));
		try {
			const data = await vehiculoService.listar();
			vehiculos.update(v => ({ ...v, items: data.vehiculos || [], loading: false }));
		} catch (error) {
			vehiculos.update(v => ({ ...v, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function abrirFormulario() {
		editandoId = null;
		formData = {
			placa: '',
			modelo: '',
			marca: '',
			año: '',
			capacidad_carga: '',
			estado_operativo: 'operativo'
		};
		mostrarFormulario = true;
	}

	function editarVehiculo(vehiculo) {
		editandoId = vehiculo.id_vehiculo;
		formData = {
			placa: vehiculo.placa,
			modelo: vehiculo.modelo,
			marca: vehiculo.marca,
			año: vehiculo.año,
			capacidad_carga: vehiculo.capacidad_carga,
			estado_operativo: vehiculo.estado_operativo
		};
		mostrarFormulario = true;
	}

	async function guardarVehiculo() {
		if (!formData.placa || !formData.marca || !formData.modelo) {
			addNotificacion('Completa campos requeridos', 'warning');
			return;
		}
		try {
			if (editandoId) {
				await vehiculoService.actualizar(editandoId, formData);
				addNotificacion('Vehículo actualizado', 'success');
			} else {
				await vehiculoService.crear(formData);
				addNotificacion('Vehículo creado', 'success');
			}
			mostrarFormulario = false;
			await cargarVehiculos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function eliminarVehiculo(id) {
		if (confirm('¿Eliminar este vehículo?')) {
			try {
				await vehiculoService.eliminar(id);
				addNotificacion('Vehículo eliminado', 'success');
				await cargarVehiculos();
			} catch (error) {
				addNotificacion(error.message, 'error');
			}
		}
	}
</script>

<svelte:head>
	<title>Gestión de Vehículos - TransConecta</title>
</svelte:head>

<div class="container">
	<div class="header">
		<div>
			<h1>🚗 Gestión de Vehículos</h1>
			<p class="subtitle">Registra y controla la flota con documentos, historial y estado operativo</p>
		</div>
		<button class="btn btn-primary" on:click={abrirFormulario}>+ Nuevo Vehículo</button>
	</div>

	{#if mostrarFormulario}
		<div class="form-card">
			<h2>{editandoId ? 'Editar' : 'Crear'} Vehículo</h2>
			<form on:submit|preventDefault={guardarVehiculo}>
				<div class="form-group">
					<label for="placa">Placa</label>
					<input id="placa" type="text" placeholder="ABC-1234" bind:value={formData.placa} required />
				</div>
				<div class="form-group">
					<label for="marca">Marca</label>
					<input id="marca" type="text" placeholder="Toyota" bind:value={formData.marca} required />
				</div>
				<div class="form-group">
					<label for="modelo">Modelo</label>
					<input id="modelo" type="text" placeholder="Hiace" bind:value={formData.modelo} required />
				</div>
				<div class="form-group">
					<label for="año">Año</label>
					<input id="año" type="number" placeholder="2023" bind:value={formData.año} required />
				</div>
				<div class="form-group">
					<label for="capacidad">Capacidad (kg)</label>
					<input id="capacidad" type="number" placeholder="1000" bind:value={formData.capacidad_carga} required />
				</div>
				<div class="form-group">
					<label for="estado">Estado Operativo</label>
					<select id="estado" bind:value={formData.estado_operativo}>
						<option value="operativo">Operativo</option>
						<option value="en_mantenimiento">En Mantenimiento</option>
						<option value="en_ruta">En Ruta</option>
					</select>
				</div>
				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Guardar</button>
					<button type="button" class="btn btn-secondary" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</div>
	{/if}

	{#if $vehiculos.loading}
		<div class="loading">Cargando vehículos...</div>
	{:else if $vehiculos.items.length === 0}
		<div class="empty-state">
			<p>No hay vehículos registrados</p>
		</div>
	{:else}
		<div class="table-responsive">
			<table>
				<thead>
					<tr>
						<th>Placa</th>
						<th>Marca</th>
						<th>Modelo</th>
						<th>Año</th>
						<th>Capacidad</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each $vehiculos.items as vehicle}
						<tr>
							<td><strong>{vehicle.placa}</strong></td>
							<td>{vehicle.marca}</td>
							<td>{vehicle.modelo}</td>
							<td>{vehicle.año}</td>
							<td>{vehicle.capacidad_carga} kg</td>
							<td>
								<span class="status" class:operativo={vehicle.estado_operativo === 'operativo'} class:mantenimiento={vehicle.estado_operativo === 'en_mantenimiento'} class:ruta={vehicle.estado_operativo === 'en_ruta'}>
									{vehicle.estado_operativo}
								</span>
							</td>
							<td>
								<button class="btn-action btn-edit" on:click={() => editarVehiculo(vehicle)}>✏️</button>
								<button class="btn-action btn-danger" on:click={() => eliminarVehiculo(vehicle.id_vehiculo)}>🗑️</button>
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
	.status.operativo { background: #c6f6d5; color: #22543d; }
	.status.mantenimiento { background: #fed7d7; color: #742a2a; }
	.status.ruta { background: #bee3f8; color: #2c5282; }
	.btn-action { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 4px; transition: all 0.2s; }
	.btn-edit { background: #bee3f8; color: #2c5282; }
	.btn-edit:hover { background: #90cdf4; }
	.btn-danger { background: #fed7d7; color: #742a2a; }
	.btn-danger:hover { background: #fc8181; }
	.loading { text-align: center; padding: 40px; color: #718096; font-size: 16px; }
	.empty-state { background: white; border-radius: 8px; padding: 60px 20px; text-align: center; color: #718096; font-size: 16px; }
</style>
