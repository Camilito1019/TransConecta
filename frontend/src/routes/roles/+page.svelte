<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { roles, addNotificacion } from '$lib/stores.js';
	import { rolService } from '$lib/api/services.js';
	import { puedeAccion, puedeVerModulo } from '$lib/permisos.js';
	import { modulosConfig } from '$lib/modulos.js';
	import { scrollToTop } from '$lib/scroll.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let confirmDelete = { open: false, id: null, nombre: '' };
	let formData = { nombre_rol: '', descripcion: '' };

	const MODULO = 'roles';
	let permiteCrearRol = false;
	let permiteEditarRol = false;
	let permiteEliminarRol = false;

	// Solo quien tenga permisos configurados puede gestionar roles
	$: permisosModulo = $modulosConfig;
	$: {
		permisosModulo;
		permiteCrearRol = puedeAccion(MODULO, 'crear');
		permiteEditarRol = puedeAccion(MODULO, 'editar');
		permiteEliminarRol = puedeAccion(MODULO, 'eliminar');
	}

	onMount(async () => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Roles', 'error');
			goto('/');
			return;
		}
		await cargarRoles();
	});

	async function cargarRoles() {
		roles.update((r) => ({ ...r, loading: true }));
		try {
			const data = await rolService.listar();
			roles.update((r) => ({ ...r, items: data.roles || [], loading: false }));
		} catch (error) {
			roles.update((r) => ({ ...r, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	async function abrirFormulario() {
		editandoId = null;
		formData = { nombre_rol: '', descripcion: '' };
		mostrarFormulario = true;
		await tick();
		scrollToTop();
	}

	async function editarRol(rol) {
		editandoId = rol.id_rol;
		formData = { nombre_rol: rol.nombre_rol, descripcion: rol.descripcion };
		mostrarFormulario = true;
		await tick();
		scrollToTop();
	}

	async function guardarRol() {
		if (!formData.nombre_rol) {
			addNotificacion('Completa el nombre del rol', 'warning');
			return;
		}
		try {
			if (editandoId) {
				await rolService.actualizar(editandoId, formData.nombre_rol, formData.descripcion);
				addNotificacion('Rol actualizado', 'success');
			} else {
				await rolService.crear(formData.nombre_rol, formData.descripcion);
				addNotificacion('Rol creado', 'success');
			}
			mostrarFormulario = false;
			await cargarRoles();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	async function eliminarRol(id) {
		if (!confirmDelete.id) return;
		try {
			await rolService.eliminar(id);
			addNotificacion('Rol eliminado', 'success');
			confirmDelete = { open: false, id: null, nombre: '' };
			await cargarRoles();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	$: stats = { total: $roles.items.length };
</script>

<svelte:head>
	<title>Gestión de Roles - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Permisos</p>
			<h1>Gestión de Roles</h1>
			<p class="lede">Define las responsabilidades y alcance de tu equipo.</p>
			<div class="chips">
				<span class="chip success">{stats.total} roles</span>
			</div>
		</div>
		<div class="hero-actions">
			{#if permiteCrearRol}
				<button class="primary" on:click={abrirFormulario}>+ Nuevo rol</button>
			{/if}
		</div>
	</section>

	{#if mostrarFormulario && (permiteCrearRol || permiteEditarRol)}
		<section class="panel">
			<div class="panel-head">
				<div>
					<p class="label">Formulario</p>
					<h2>{editandoId ? 'Editar rol' : 'Nuevo rol'}</h2>
				</div>
				<button class="ghost" on:click={() => (mostrarFormulario = false)}>Cerrar</button>
			</div>
			<form class="form-grid" on:submit|preventDefault={guardarRol}>
				<label class="field">
					<span>Nombre del rol</span>
					<input type="text" placeholder="Ej. Administrador" bind:value={formData.nombre_rol} required />
				</label>
				<label class="field">
					<span>Descripción</span>
					<textarea placeholder="Describe responsabilidades" bind:value={formData.descripcion}></textarea>
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
				<h2>Roles</h2>
			</div>
		</div>

		{#if $roles.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando roles...</p>
			</div>
		{:else if $roles.items.length === 0}
			<div class="empty">
				<p>No hay roles registrados.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Descripción</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $roles.items as rol}
							<tr>
								<td>{rol.nombre_rol}</td>
								<td>{rol.descripcion || '—'}</td>
									<td class="actions">
										{#if permiteEditarRol}
											<button class="ghost" on:click={() => editarRol(rol)}>Editar</button>
										{/if}
										{#if permiteEliminarRol}
											<button class="danger" on:click={() => (confirmDelete = { open: true, id: rol.id_rol, nombre: rol.nombre_rol })}>Eliminar</button>
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
				<h3>¿Eliminar rol?</h3>
				<p class="lede">Se eliminará <strong>{confirmDelete.nombre}</strong>. Esta acción no se puede deshacer.</p>
				<div class="modal-actions">
					<button class="ghost" on:click={() => (confirmDelete = { open: false, id: null, nombre: '' })}>Cancelar</button>
					<button class="danger" on:click={() => eliminarRol(confirmDelete.id)}>Eliminar</button>
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
	.lede { margin: 0; color: var(--tc-text-muted); font-size: 14px; max-width: 520px; }
	.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
	.chip { padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; border: 1px solid var(--tc-border-strong); background: var(--tc-surface-3); color: var(--tc-accent-2); }
	.chip.success { background: var(--tc-success-bg); border-color: var(--tc-success-border); color: var(--tc-success-text); }

	.hero-actions { display: flex; gap: 10px; }
	.primary { background: linear-gradient(135deg, var(--tc-accent), var(--tc-accent-2)); color: var(--tc-on-accent); border: 1px solid color-mix(in srgb, var(--tc-accent), var(--tc-border) 55%); border-radius: 12px; padding: 10px 14px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 26px color-mix(in srgb, var(--tc-accent), transparent 75%); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.primary:hover { transform: translateY(-1px); box-shadow: 0 16px 30px color-mix(in srgb, var(--tc-accent), transparent 70%); }
	.primary:active { transform: translateY(0); box-shadow: 0 10px 22px color-mix(in srgb, var(--tc-accent), transparent 78%); }

	.panel { position: relative; z-index: 1; background: var(--tc-surface); border-radius: 16px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); padding: 18px 18px 22px 18px; margin-bottom: 16px; }
	.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: var(--tc-text-muted); margin: 0; font-weight: 800; }
	.panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

	.ghost, .danger { border-radius: 12px; padding: 10px 12px; font-weight: 700; cursor: pointer; border: 1px solid var(--tc-border); background: var(--tc-surface); color: var(--tc-accent-2); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.ghost:hover, .danger:hover { transform: translateY(-1px); }
	.danger { color: var(--tc-danger-text); border-color: var(--tc-danger-border); background: var(--tc-danger-bg); }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: var(--tc-text); }
	.field input, .field textarea { padding: 12px 12px; border-radius: 12px; border: 1.5px solid var(--tc-border); background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%); font-size: 14px; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; font-family: inherit; resize: vertical; min-height: 46px; }
	.field textarea { min-height: 96px; }
	.field input:focus, .field textarea:focus { outline: none; border-color: var(--tc-accent); box-shadow: 0 10px 30px color-mix(in srgb, var(--tc-accent), transparent 85%); background: var(--tc-surface); }
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; }

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
		tbody td:last-child { padding-top: 8px; }
	}
</style>
