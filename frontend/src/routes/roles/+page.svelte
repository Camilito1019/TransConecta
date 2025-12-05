<script>
	import { onMount } from 'svelte';
	import { roles, addNotificacion } from '$lib/stores.js';
	import { rolService } from '$lib/api/services.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let formData = { nombre: '', descripcion: '' };

	onMount(async () => {
		await cargarRoles();
	});

	async function cargarRoles() {
		roles.update(r => ({ ...r, loading: true }));
		try {
			const data = await rolService.listar();
			roles.update(r => ({ ...r, items: data.roles || [], loading: false }));
		} catch (error) {
			roles.update(r => ({ ...r, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function abrirFormulario() {
		editandoId = null;
		formData = { nombre: '', descripcion: '' };
		mostrarFormulario = true;
	}

	function editarRol(rol) {
		editandoId = rol.id_rol;
		formData = { nombre: rol.nombre, descripcion: rol.descripcion };
		mostrarFormulario = true;
	}

	async function guardarRol() {
		if (!formData.nombre) {
			addNotificacion('Completa el nombre del rol', 'warning');
			return;
		}
		try {
			if (editandoId) {
				await rolService.actualizar(editandoId, formData);
				addNotificacion('Rol actualizado', 'success');
			} else {
				await rolService.crear(formData.nombre, formData.descripcion);
				addNotificacion('Rol creado', 'success');
			}
			mostrarFormulario = false;
			await cargarRoles();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function eliminarRol(id) {
		if (confirm('¿Eliminar este rol?')) {
			try {
				await rolService.eliminar(id);
				addNotificacion('Rol eliminado', 'success');
				await cargarRoles();
			} catch (error) {
				addNotificacion(error.message, 'error');
			}
		}
	}
</script>

<svelte:head>
	<title>Gestión de Roles - TransConecta</title>
</svelte:head>

<div class="container">
	<div class="header">
		<div>
			<h1>👑 Gestión de Roles</h1>
			<p class="subtitle">Define roles y permisos del sistema</p>
		</div>
		<button class="btn btn-primary" on:click={abrirFormulario}>+ Nuevo Rol</button>
	</div>

	{#if mostrarFormulario}
		<div class="form-card">
			<h2>{editandoId ? 'Editar' : 'Crear'} Rol</h2>
			<form on:submit|preventDefault={guardarRol}>
				<div class="form-group">
					<label for="nombre">Nombre del Rol</label>
					<input id="nombre" type="text" placeholder="Ej: Administrador" bind:value={formData.nombre} required />
				</div>
				<div class="form-group">
					<label for="descripcion">Descripción</label>
					<textarea id="descripcion" placeholder="Describe las responsabilidades" bind:value={formData.descripcion}></textarea>
				</div>
				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Guardar</button>
					<button type="button" class="btn btn-secondary" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</div>
	{/if}

	{#if $roles.loading}
		<div class="loading">Cargando roles...</div>
	{:else if $roles.items.length === 0}
		<div class="empty-state">
			<p>No hay roles registrados</p>
		</div>
	{:else}
		<div class="table-responsive">
			<table>
				<thead>
					<tr>
						<th>Nombre</th>
						<th>Descripción</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each $roles.items as rol}
						<tr>
							<td><strong>{rol.nombre}</strong></td>
							<td>{rol.descripcion || 'N/A'}</td>
							<td>
								<button class="btn-action btn-edit" on:click={() => editarRol(rol)}>✏️</button>
								<button class="btn-action btn-danger" on:click={() => eliminarRol(rol.id_rol)}>🗑️</button>
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
	form { display: grid; grid-template-columns: 1fr; gap: 16px; }
	.form-group { display: flex; flex-direction: column; gap: 6px; }
	.form-group label { font-weight: 500; color: #2d3748; font-size: 14px; }
	.form-group input, .form-group textarea { padding: 10px 12px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px; font-family: inherit; }
	.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
	.form-group textarea { resize: vertical; min-height: 80px; }
	.form-actions { display: flex; gap: 10px; }
	.table-responsive { background: white; border-radius: 8px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
	table { width: 100%; border-collapse: collapse; }
	th { background: #f7fafc; padding: 16px; text-align: left; font-weight: 600; color: #2d3748; border-bottom: 2px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
	td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px; }
	tr:hover { background: #f7fafc; }
	.btn-action { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 4px; transition: all 0.2s; }
	.btn-edit { background: #bee3f8; color: #2c5282; }
	.btn-edit:hover { background: #90cdf4; }
	.btn-danger { background: #fed7d7; color: #742a2a; }
	.btn-danger:hover { background: #fc8181; }
	.loading { text-align: center; padding: 40px; color: #718096; font-size: 16px; }
	.empty-state { background: white; border-radius: 8px; padding: 60px 20px; text-align: center; color: #718096; font-size: 16px; }
</style>
