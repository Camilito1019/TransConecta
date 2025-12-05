<script>
	import { onMount } from 'svelte';
	import { conductores, addNotificacion } from '$lib/stores.js';
	import { conductorService } from '$lib/api/services.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let formData = {
		nombre: '',
		apellido: '',
		numero_identificacion: '',
		numero_licencia: '',
		estado: 'activo'
	};

	onMount(async () => {
		await cargarConductores();
	});

	async function cargarConductores() {
		conductores.update(c => ({ ...c, loading: true }));
		try {
			const data = await conductorService.listar();
			conductores.update(c => ({ ...c, items: data.conductores || [], loading: false }));
		} catch (error) {
			conductores.update(c => ({ ...c, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function abrirFormulario() {
		editandoId = null;
		formData = { nombre: '', apellido: '', numero_identificacion: '', numero_licencia: '', estado: 'activo' };
		mostrarFormulario = true;
	}

	function editarConductor(conductor) {
		editandoId = conductor.id_conductor;
		formData = {
			nombre: conductor.nombre,
			apellido: conductor.apellido,
			numero_identificacion: conductor.numero_identificacion,
			numero_licencia: conductor.numero_licencia,
			estado: conductor.estado
		};
		mostrarFormulario = true;
	}

	async function guardarConductor() {
		if (!formData.nombre || !formData.apellido || !formData.numero_identificacion || !formData.numero_licencia) {
			addNotificacion('Completa todos los campos', 'warning');
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

	async function activarConductor(id) {
		try {
			await conductorService.activar(id);
			addNotificacion('Conductor activado', 'success');
			await cargarConductores();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function desactivarConductor(id) {
		try {
			await conductorService.desactivar(id);
			addNotificacion('Conductor desactivado', 'success');
			await cargarConductores();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}
</script>

<svelte:head>
	<title>Gestión de Conductores - TransConecta</title>
</svelte:head>

<div class="container">
	<div class="header">
		<div>
			<h1>🚦 Gestión de Conductores</h1>
			<p class="subtitle">Monitorea horas de conducción, alertas de fatiga y estado de conductores</p>
		</div>
		<button class="btn btn-primary" on:click={abrirFormulario}>+ Nuevo Conductor</button>
	</div>

	{#if mostrarFormulario}
		<div class="form-card">
			<h2>{editandoId ? 'Editar' : 'Crear'} Conductor</h2>
			<form on:submit|preventDefault={guardarConductor}>
				<div class="form-group">
					<label for="nombre">Nombre</label>
					<input id="nombre" type="text" placeholder="Juan" bind:value={formData.nombre} required />
				</div>
				<div class="form-group">
					<label for="apellido">Apellido</label>
					<input id="apellido" type="text" placeholder="Pérez" bind:value={formData.apellido} required />
				</div>
				<div class="form-group">
					<label for="id">Número de Identificación</label>
					<input id="id" type="text" placeholder="1234567890" bind:value={formData.numero_identificacion} required />
				</div>
				<div class="form-group">
					<label for="licencia">Número de Licencia</label>
					<input id="licencia" type="text" placeholder="LIC-123456" bind:value={formData.numero_licencia} required />
				</div>
				<div class="form-group">
					<label for="estado">Estado</label>
					<select id="estado" bind:value={formData.estado}>
						<option value="activo">Activo</option>
						<option value="inactivo">Inactivo</option>
					</select>
				</div>
				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Guardar</button>
					<button type="button" class="btn btn-secondary" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</div>
	{/if}

	{#if $conductores.loading}
		<div class="loading">Cargando conductores...</div>
	{:else if $conductores.items.length === 0}
		<div class="empty-state">
			<p>No hay conductores registrados</p>
		</div>
	{:else}
		<div class="table-responsive">
			<table>
				<thead>
					<tr>
						<th>Nombre</th>
						<th>Apellido</th>
						<th>Identificación</th>
						<th>Licencia</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each $conductores.items as conductor}
						<tr>
							<td>{conductor.nombre}</td>
							<td>{conductor.apellido}</td>
							<td>{conductor.numero_identificacion}</td>
							<td>{conductor.numero_licencia}</td>
							<td>
								<span class="status" class:active={conductor.estado === 'activo'} class:inactive={conductor.estado === 'inactivo'}>
									{conductor.estado}
								</span>
							</td>
							<td>
								<button class="btn-action btn-edit" on:click={() => editarConductor(conductor)}>✏️</button>
								{#if conductor.estado === 'activo'}
									<button class="btn-action btn-danger" on:click={() => desactivarConductor(conductor.id_conductor)}>⊘</button>
								{:else}
									<button class="btn-action btn-success" on:click={() => activarConductor(conductor.id_conductor)}>✓</button>
								{/if}
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
	.status.active { background: #c6f6d5; color: #22543d; }
	.status.inactive { background: #fed7d7; color: #742a2a; }
	.btn-action { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 4px; transition: all 0.2s; }
	.btn-edit { background: #bee3f8; color: #2c5282; }
	.btn-edit:hover { background: #90cdf4; }
	.btn-danger { background: #fed7d7; color: #742a2a; }
	.btn-danger:hover { background: #fc8181; }
	.btn-success { background: #c6f6d5; color: #22543d; }
	.btn-success:hover { background: #9ae6b4; }
	.loading { text-align: center; padding: 40px; color: #718096; font-size: 16px; }
	.empty-state { background: white; border-radius: 8px; padding: 60px 20px; text-align: center; color: #718096; font-size: 16px; }
</style>
