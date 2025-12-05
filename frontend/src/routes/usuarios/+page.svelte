<script>
	import { onMount } from 'svelte';
	import { usuarios, roles, addNotificacion } from '$lib/stores.js';
	import { usuarioService, rolService } from '$lib/api/services.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let formData = {
		nombre_usuario: '',
		correo: '',
		contraseña: '',
		id_rol: '',
		estado: 'activo'
	};
	let listaRoles = [];

	onMount(async () => {
		await cargarDatos();
	});

	async function cargarDatos() {
		try {
			usuarios.update(u => ({ ...u, loading: true }));
			const [usersRes, rolesRes] = await Promise.all([
				usuarioService.listar(),
				rolService.listar()
			]);
			usuarios.update(u => ({ ...u, items: usersRes.usuarios || [], loading: false }));
			listaRoles = rolesRes.roles || [];
		} catch (error) {
			usuarios.update(u => ({ ...u, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function abrirFormulario() {
		editandoId = null;
		formData = { nombre_usuario: '', correo: '', contraseña: '', id_rol: '', estado: 'activo' };
		mostrarFormulario = true;
	}

	function editarUsuario(user) {
		editandoId = user.id_usuario;
		formData = {
			nombre_usuario: user.nombre_usuario,
			correo: user.correo,
			contraseña: '',
			id_rol: user.id_rol,
			estado: user.estado
		};
		mostrarFormulario = true;
	}

	async function guardarUsuario() {
		if (!formData.nombre_usuario || !formData.correo || !formData.id_rol) {
			addNotificacion('Completa todos los campos', 'warning');
			return;
		}

		try {
			if (editandoId) {
				await usuarioService.actualizar(editandoId, {
					nombre_usuario: formData.nombre_usuario,
					correo: formData.correo,
					id_rol: formData.id_rol,
					estado: formData.estado
				});
				addNotificacion('Usuario actualizado', 'success');
			} else {
				if (!formData.contraseña) {
					addNotificacion('Ingresa contraseña para nuevo usuario', 'warning');
					return;
				}
				await usuarioService.crear({
					nombre_usuario: formData.nombre_usuario,
					correo: formData.correo,
					contraseña: formData.contraseña,
					id_rol: formData.id_rol
				});
				addNotificacion('Usuario creado', 'success');
			}
			mostrarFormulario = false;
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function desactivarUsuario(id) {
		try {
			await usuarioService.desactivar(id);
			addNotificacion('Usuario desactivado', 'success');
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function activarUsuario(id) {
		try {
			await usuarioService.activar(id);
			addNotificacion('Usuario activado', 'success');
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}
</script>

<svelte:head>
	<title>Gestión de Usuarios - TransConecta</title>
</svelte:head>

<div class="container">
	<div class="header">
		<div>
			<h1>👤 Gestión de Usuarios</h1>
			<p class="subtitle">Crea, edita y administra usuarios con roles y permisos específicos</p>
		</div>
		<button class="btn btn-primary" on:click={abrirFormulario}>+ Nuevo Usuario</button>
	</div>

	{#if mostrarFormulario}
		<div class="form-card">
			<h2>{editandoId ? 'Editar' : 'Crear'} Usuario</h2>
			<form on:submit|preventDefault={guardarUsuario}>
				<div class="form-group">
					<label for="nombre">Nombre de Usuario</label>
					<input id="nombre" type="text" placeholder="Juan Pérez" bind:value={formData.nombre_usuario} required />
				</div>
				<div class="form-group">
					<label for="correo">Correo Electrónico</label>
					<input id="correo" type="email" placeholder="juan@ejemplo.com" bind:value={formData.correo} required />
				</div>
				{#if !editandoId}
					<div class="form-group">
						<label for="password">Contraseña</label>
						<input id="password" type="password" placeholder="••••••••" bind:value={formData.contraseña} required />
					</div>
				{/if}
				<div class="form-group">
					<label for="rol">Rol</label>
					<select id="rol" bind:value={formData.id_rol} required>
						<option value="">Seleccionar rol</option>
						{#each listaRoles as role}
							<option value={role.id_rol}>{role.nombre}</option>
						{/each}
					</select>
				</div>
				{#if editandoId}
					<div class="form-group">
						<label for="estado">Estado</label>
						<select id="estado" bind:value={formData.estado}>
							<option value="activo">Activo</option>
							<option value="inactivo">Inactivo</option>
						</select>
					</div>
				{/if}
				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Guardar</button>
					<button type="button" class="btn btn-secondary" on:click={() => (mostrarFormulario = false)}>Cancelar</button>
				</div>
			</form>
		</div>
	{/if}

	{#if $usuarios.loading}
		<div class="loading">Cargando usuarios...</div>
	{:else if $usuarios.items.length === 0}
		<div class="empty-state">
			<p>No hay usuarios registrados</p>
		</div>
	{:else}
		<div class="table-responsive">
			<table>
				<thead>
					<tr>
						<th>Nombre</th>
						<th>Correo</th>
						<th>Rol</th>
						<th>Estado</th>
						<th>Fecha Creación</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each $usuarios.items as user}
						<tr>
							<td>{user.nombre_usuario}</td>
							<td>{user.correo}</td>
							<td><span class="badge">{user.nombre_rol || 'N/A'}</span></td>
							<td>
								<span class="status" class:active={user.estado === 'activo'} class:inactive={user.estado === 'inactivo'}>
									{user.estado}
								</span>
							</td>
							<td>{new Date(user.fecha_creacion).toLocaleDateString()}</td>
							<td>
								<button class="btn-action btn-edit" on:click={() => editarUsuario(user)}>✏️</button>
								{#if user.estado === 'activo'}
									<button class="btn-action btn-danger" on:click={() => desactivarUsuario(user.id_usuario)}>⊘</button>
								{:else}
									<button class="btn-action btn-success" on:click={() => activarUsuario(user.id_usuario)}>✓</button>
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
	.container {
		padding: 20px;
		width: 100%;
		box-sizing: border-box;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30px;
		gap: 20px;
	}

	.header h1 {
		margin: 0;
		font-size: 28px;
		color: #1a202c;
	}

	.subtitle {
		margin: 8px 0 0 0;
		color: #718096;
		font-size: 14px;
	}

	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.3s;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: #e2e8f0;
		color: #2d3748;
	}

	.btn-secondary:hover {
		background: #cbd5e0;
	}

	.form-card {
		background: white;
		border-radius: 8px;
		padding: 24px;
		margin-bottom: 30px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.form-card h2 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #1a202c;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 16px;
	}

	.form-group label {
		margin-bottom: 6px;
		font-weight: 500;
		color: #2d3748;
		font-size: 14px;
	}

	.form-group input,
	.form-group select {
		padding: 10px 12px;
		border: 1px solid #cbd5e0;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.form-actions {
		display: flex;
		gap: 10px;
		margin-top: 20px;
	}

	.table-responsive {
		background: white;
		border-radius: 8px;
		overflow-x: auto;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		background: #f7fafc;
		padding: 16px;
		text-align: left;
		font-weight: 600;
		color: #2d3748;
		border-bottom: 2px solid #e2e8f0;
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	td {
		padding: 14px 16px;
		border-bottom: 1px solid #e2e8f0;
		color: #4a5568;
		font-size: 14px;
	}

	tr:hover {
		background: #f7fafc;
	}

	.badge {
		display: inline-block;
		padding: 4px 12px;
		background: #edf2f7;
		color: #2d3748;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}

	.status {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}

	.status.active {
		background: #c6f6d5;
		color: #22543d;
	}

	.status.inactive {
		background: #fed7d7;
		color: #742a2a;
	}

	.btn-action {
		padding: 6px 10px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		margin-right: 4px;
		transition: all 0.2s;
	}

	.btn-edit {
		background: #bee3f8;
		color: #2c5282;
	}

	.btn-edit:hover {
		background: #90cdf4;
	}

	.btn-danger {
		background: #fed7d7;
		color: #742a2a;
	}

	.btn-danger:hover {
		background: #fc8181;
	}

	.btn-success {
		background: #c6f6d5;
		color: #22543d;
	}

	.btn-success:hover {
		background: #9ae6b4;
	}

	.loading {
		text-align: center;
		padding: 40px;
		color: #718096;
		font-size: 16px;
	}

	.empty-state {
		background: white;
		border-radius: 8px;
		padding: 60px 20px;
		text-align: center;
		color: #718096;
		font-size: 16px;
	}
</style>
