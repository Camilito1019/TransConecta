<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { usuarios, addNotificacion } from '$lib/stores.js';
	import { usuarioService, rolService } from '$lib/api/services.js';
	import { puedeCrear, puedeEditar, puedeEliminar, puedeCambiarEstado, puedeVerModulo } from '$lib/permisos.js';
	import { modulosConfig } from '$lib/modulos.js';
	import { scrollToTop } from '$lib/scroll.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let confirmDelete = { open: false, id: null, nombre: '' };
	let formData = {
		nombre_usuario: '',
		correo: '',
		id_rol: '',
		estado: 'activo'
	};
	let listaRoles = [];

	const MODULO = 'usuarios';

	let puedeCrearUsuarios = false;
	let puedeEditarUsuarios = false;
	let puedeEliminarUsuarios = false;
	let puedeCambiarEstadoUsuarios = false;

	$: permisosModulo = $modulosConfig;
	$: {
		permisosModulo;
		puedeCrearUsuarios = puedeCrear(MODULO);
		puedeEditarUsuarios = puedeEditar(MODULO);
		puedeEliminarUsuarios = puedeEliminar(MODULO);
		puedeCambiarEstadoUsuarios = puedeCambiarEstado(MODULO);
	}

	onMount(async () => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Usuarios', 'error');
			goto('/');
			return;
		}
		await cargarDatos();
	});

	async function cargarDatos() {
		try {
			usuarios.update((u) => ({ ...u, loading: true }));
			const [usersRes, rolesRes] = await Promise.all([
				usuarioService.listar(),
				rolService.listar()
			]);
			usuarios.update((u) => ({ ...u, items: usersRes.usuarios || [], loading: false }));
			listaRoles = rolesRes.roles || [];
		} catch (error) {
			usuarios.update((u) => ({ ...u, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	async function abrirFormulario() {
		editandoId = null;
		formData = { nombre_usuario: '', correo: '', id_rol: '', estado: 'activo' };
		mostrarFormulario = true;
		await tick();
		scrollToTop();
	}

	async function editarUsuario(user) {
		editandoId = user.id_usuario;
		formData = {
			nombre_usuario: user.nombre_usuario,
			correo: user.correo,
			id_rol: user.id_rol,
			estado: user.estado
		};
		mostrarFormulario = true;
		await tick();
		scrollToTop();
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
					id_rol: Number(formData.id_rol),
					estado: formData.estado
				});
				addNotificacion('Usuario actualizado', 'success');
			} else {
				await usuarioService.registrar(
					formData.nombre_usuario,
					formData.correo,
					Number(formData.id_rol)
				);
				addNotificacion('Usuario creado. Se envió un correo con las credenciales.', 'success');
			}
			mostrarFormulario = false;
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function desactivarUsuario(id) {
		try {
			await usuarioService.inactivar(id);
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

	async function eliminarUsuario(id) {
		if (!confirmDelete.id) return;
		try {
			await usuarioService.eliminar(id);
			addNotificacion('Usuario eliminado', 'success');
			confirmDelete = { open: false, id: null, nombre: '' };
			await cargarDatos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	$: stats = {
		total: $usuarios.items.length,
		activos: $usuarios.items.filter((u) => u.estado === 'activo').length,
		inactivos: $usuarios.items.filter((u) => u.estado === 'inactivo').length
	};
</script>

<svelte:head>
	<title>Gestión de Usuarios - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Equipo</p>
			<h1>Gestión de Usuarios</h1>
			<p class="lede">Administra cuentas, roles y estado operativo de tu equipo.</p>
			<div class="chips">
				<span class="chip success">{stats.activos} activos</span>
				<span class="chip muted">{stats.inactivos} inactivos</span>
			</div>
		</div>
		<div class="hero-actions">
			{#if puedeCrearUsuarios}
				<button class="primary" on:click={abrirFormulario}>+ Nuevo usuario</button>
			{/if}
		</div>
	</section>

	{#if mostrarFormulario}
		<section class="panel">
			<div class="panel-head">
				<div>
					<p class="label">Formulario</p>
					<h2>{editandoId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
				</div>
				<button class="ghost" on:click={() => (mostrarFormulario = false)}>Cerrar</button>
			</div>
			<form class="form-grid" on:submit|preventDefault={guardarUsuario}>
				<label class="field">
					<span>Nombre de usuario</span>
					<input type="text" placeholder="Ej. Juan Pérez" bind:value={formData.nombre_usuario} required />
				</label>
				<label class="field">
					<span>Correo</span>
					<input type="email" placeholder="correo@empresa.com" bind:value={formData.correo} required />
				</label>
				<label class="field">
					<span>Rol</span>
					<select bind:value={formData.id_rol} required>
						<option value="">Selecciona un rol</option>
						{#each listaRoles as role}
							<option value={role.id_rol}>{role.nombre_rol}</option>
						{/each}
					</select>
				</label>
				{#if editandoId}
					<label class="field">
						<span>Estado</span>
						<select bind:value={formData.estado}>
							<option value="activo">Activo</option>
							<option value="inactivo">Inactivo</option>
						</select>
					</label>
				{/if}
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
				<h2>Usuarios</h2>
			</div>
		</div>

		{#if $usuarios.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando usuarios...</p>
			</div>
		{:else if $usuarios.items.length === 0}
			<div class="empty">
				<p>No hay usuarios registrados.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Usuario</th>
							<th>Correo</th>
							<th>Rol</th>
							<th>Estado</th>
							<th>Creación</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $usuarios.items as user}
							<tr>
								<td>{user.nombre_usuario}</td>
								<td>{user.correo}</td>
								<td><span class="pill">{user.nombre_rol || 'N/A'}</span></td>
								<td>
									<span class={`status ${user.estado === 'activo' ? 'green' : 'red'}`}>
										{user.estado}
									</span>
								</td>
								<td>{new Date(user.fecha_creacion).toLocaleDateString()}</td>
								<td class="actions">
									{#if puedeEditarUsuarios}
										<button class="ghost" on:click={() => editarUsuario(user)}>Editar</button>
									{/if}
									{#if puedeCambiarEstadoUsuarios}
										{#if user.estado === 'activo'}
											<button class="danger" on:click={() => desactivarUsuario(user.id_usuario)}>Desactivar</button>
										{:else}
											<button class="success" on:click={() => activarUsuario(user.id_usuario)}>Activar</button>
										{/if}
									{/if}
									{#if puedeEliminarUsuarios}
										<button class="outline" on:click={() => (confirmDelete = { open: true, id: user.id_usuario, nombre: user.nombre_usuario })}>Eliminar</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

		{#if confirmDelete.open}
			<div class="modal-backdrop">
				<div class="modal">
					<p class="label">Confirmar</p>
					<h3>¿Eliminar usuario?</h3>
					<p class="lede">Se eliminará <strong>{confirmDelete.nombre}</strong>. Esta acción no se puede deshacer.</p>
					<div class="modal-actions">
						<button class="ghost" on:click={() => (confirmDelete = { open: false, id: null, nombre: '' })}>Cancelar</button>
						<button class="danger" on:click={() => eliminarUsuario(confirmDelete.id)}>Eliminar</button>
					</div>
				</div>
			</div>
		{/if}
</div>

<style>
	.page-shell {
		position: relative;
		padding: 22px 20px 60px 20px;
		font-family: var(--tc-font);
		color: var(--tc-text);
	}

	.bg-shape {
		position: absolute;
		border-radius: 999px;
		filter: blur(90px);
		opacity: 0.26;
		z-index: 0;
	}

	.shape-a {
		width: 420px;
		height: 420px;
		background: color-mix(in srgb, var(--tc-accent), transparent 78%);
		top: -140px;
		left: -120px;
	}
	.shape-b {
		width: 360px;
		height: 360px;
		background: color-mix(in srgb, var(--tc-accent-2), transparent 80%);
		bottom: -160px;
		right: -120px;
	}
	:global(html[data-theme='dark']) .page-shell .bg-shape { opacity: 0.18; }

	.hero {
		position: relative;
		z-index: 1;
		display: flex;
		justify-content: space-between;
		gap: 16px;
		align-items: center;
		background: linear-gradient(125deg, var(--tc-surface) 0%, var(--tc-surface-2) 100%);
		border: 1px solid var(--tc-border);
		border-radius: 16px;
		padding: 18px 20px;
		box-shadow: var(--tc-shadow);
		margin-bottom: 16px;
	}

	.hero-text h1 { margin: 6px 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
	.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: var(--tc-accent-2); font-weight: 800; margin: 0; }
	.lede { margin: 0; color: var(--tc-text-muted); font-size: 14px; max-width: 540px; }
	.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
	.chip {
		padding: 8px 12px;
		border-radius: 999px;
		font-weight: 700;
		font-size: 13px;
		border: 1px solid var(--tc-border-strong);
		background: var(--tc-surface-3);
		color: var(--tc-accent-2);
	}
	.chip.muted {
		background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 40%);
		border-color: var(--tc-border);
		color: var(--tc-text-muted);
	}
	.chip.success { background: var(--tc-success-bg); border-color: var(--tc-success-border); color: var(--tc-success-text); }

	.hero-actions { display: flex; gap: 10px; }
	.primary {
		background: linear-gradient(135deg, var(--tc-accent), var(--tc-accent-2));
		color: var(--tc-on-accent);
		border: 1px solid color-mix(in srgb, var(--tc-accent), var(--tc-border) 55%);
		border-radius: 12px;
		padding: 10px 14px;
		font-weight: 800;
		cursor: pointer;
		box-shadow: 0 12px 26px color-mix(in srgb, var(--tc-accent), transparent 75%);
		transition: transform 0.12s ease, box-shadow 0.18s ease;
	}
	.primary:hover { transform: translateY(-1px); box-shadow: 0 16px 30px color-mix(in srgb, var(--tc-accent), transparent 70%); }
	.primary:active { transform: translateY(0); box-shadow: 0 10px 22px color-mix(in srgb, var(--tc-accent), transparent 78%); }

	.panel {
		position: relative;
		z-index: 1;
		background: var(--tc-surface);
		border-radius: 16px;
		border: 1px solid var(--tc-border);
		box-shadow: var(--tc-shadow);
		padding: 18px 18px 22px 18px;
		margin-bottom: 16px;
	}

	.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: var(--tc-text-muted); margin: 0; font-weight: 800; }
	.panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

	.ghost, .outline, .success, .danger {
		border-radius: 12px;
		padding: 10px 12px;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid var(--tc-border);
		background: var(--tc-surface);
		color: var(--tc-accent-2);
		transition: transform 0.12s ease, box-shadow 0.18s ease;
	}

	.ghost:hover, .outline:hover, .success:hover, .danger:hover { transform: translateY(-1px); }
	.outline { color: var(--tc-text); border-color: var(--tc-border-strong); }
	.success { color: var(--tc-success-text); border-color: var(--tc-success-border); background: var(--tc-success-bg); }
	.danger { color: var(--tc-danger-text); border-color: var(--tc-danger-border); background: var(--tc-danger-bg); }

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 14px;
		margin-top: 14px;
	}

	.field { display: grid; gap: 6px; font-size: 14px; color: var(--tc-text); }
	.field input, .field select {
		padding: 12px 12px;
		border-radius: 12px;
		border: 1.5px solid var(--tc-border);
		background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%);
		font-size: 14px;
		transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
		font-family: inherit;
	}
	.field input:focus, .field select:focus {
		outline: none;
		border-color: var(--tc-accent);
		box-shadow: 0 10px 30px color-mix(in srgb, var(--tc-accent), transparent 85%);
		background: var(--tc-surface);
	}

	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; }

	.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); }
	table { width: 100%; border-collapse: collapse; font-size: 14px; }
	thead { background: var(--tc-surface-2); }
	thead th { text-align: left; padding: 14px; font-weight: 800; color: var(--tc-text); border-bottom: 1px solid var(--tc-border); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
	tbody td { padding: 14px; border-bottom: 1px solid color-mix(in srgb, var(--tc-border), transparent 40%); color: var(--tc-text); }
	tbody tr:hover { background: color-mix(in srgb, var(--tc-accent), var(--tc-surface) 92%); }

	.pill { display: inline-block; padding: 6px 10px; border-radius: 10px; background: var(--tc-surface-3); border: 1px solid var(--tc-border-strong); color: var(--tc-accent-2); font-weight: 700; font-size: 12px; }
	.status { padding: 6px 10px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: capitalize; border: 1px solid transparent; }
	.status.green { background: var(--tc-success-bg); color: var(--tc-success-text); border-color: var(--tc-success-border); }
	.status.red { background: var(--tc-danger-bg); color: var(--tc-danger-text); border-color: var(--tc-danger-border); }
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
		tbody td:last-child { padding-top: 8px; }
	}
</style>
