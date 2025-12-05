<script>
	import { onMount } from 'svelte';
	import { conductores, addNotificacion } from '$lib/stores.js';
	import { conductorService } from '$lib/api/services.js';
	import { estadoLabel, estadoClass } from '$lib/status.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let confirmAction = { open: false, type: null, id: null, label: '' };
	let formData = {
		nombre: '',
		cedula: '',
		telefono: '',
		licencia_conduccion: '',
		estado: 'activo'
	};

	onMount(async () => {
		await cargarConductores();
	});

	async function cargarConductores() {
		conductores.update((c) => ({ ...c, loading: true }));
		try {
			const data = await conductorService.listar();
			conductores.update((c) => ({ ...c, items: data.conductores || [], loading: false }));
		} catch (error) {
			conductores.update((c) => ({ ...c, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function resetForm() {
		editandoId = null;
		formData = {
			nombre: '',
			cedula: '',
			telefono: '',
			licencia_conduccion: '',
			estado: 'activo'
		};
	}

	function abrirFormulario() {
		resetForm();
		mostrarFormulario = true;
	}

	function editarConductor(conductor) {
		editandoId = conductor.id_conductor;
		formData = {
			nombre: conductor.nombre || '',
			cedula: conductor.cedula || '',
			telefono: conductor.telefono || '',
			licencia_conduccion: conductor.licencia_conduccion || '',
			estado: conductor.estado || 'activo'
		};
		mostrarFormulario = true;
	}

	async function guardarConductor() {
		if (!formData.nombre || !formData.cedula) {
			addNotificacion('Completa nombre y cédula', 'warning');
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

	function solicitarAccion(type, conductor) {
		confirmAction = {
			open: true,
			type,
			id: conductor.id_conductor,
			label: conductor.nombre
		};
	}

	async function confirmarAccion() {
		if (!confirmAction.id || !confirmAction.type) return;
		try {
			if (confirmAction.type === 'eliminar') {
				await conductorService.eliminar(confirmAction.id);
				addNotificacion('Conductor eliminado', 'success');
			} else if (confirmAction.type === 'desactivar') {
				await conductorService.desactivar(confirmAction.id);
				addNotificacion('Conductor desactivado', 'success');
			} else if (confirmAction.type === 'activar') {
				await conductorService.activar(confirmAction.id);
				addNotificacion('Conductor activado', 'success');
			}
			confirmAction = { open: false, type: null, id: null, label: '' };
			await cargarConductores();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	$: stats = {
		total: $conductores.items.length,
		activos: $conductores.items.filter((c) => c.estado === 'activo').length,
		inactivos: $conductores.items.filter((c) => c.estado === 'inactivo').length
	};
</script>

<svelte:head>
	<title>Gestión de Conductores - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Operaciones</p>
			<h1>Gestión de Conductores</h1>
			<p class="lede">Administra conductores, licencias y estado operativo.</p>
			<div class="chips">
				<span class="chip success">{stats.activos} activos</span>
				<span class="chip muted">{stats.inactivos} inactivos</span>
			</div>
		</div>
		<div class="hero-actions">
			<button class="primary" on:click={abrirFormulario}>+ Nuevo conductor</button>
		</div>
	</section>

	{#if mostrarFormulario}
		<section class="panel">
			<div class="panel-head">
				<div>
					<p class="label">Formulario</p>
					<h2>{editandoId ? 'Editar conductor' : 'Nuevo conductor'}</h2>
				</div>
				<button class="ghost" on:click={() => (mostrarFormulario = false)}>Cerrar</button>
			</div>
			<form class="form-grid" on:submit|preventDefault={guardarConductor}>
				<label class="field">
					<span>Nombre</span>
					<input type="text" placeholder="Juan Pérez" bind:value={formData.nombre} required />
				</label>
				<label class="field">
					<span>Cédula</span>
					<input type="text" placeholder="1234567890" bind:value={formData.cedula} required />
				</label>
				<label class="field">
					<span>Teléfono</span>
					<input type="text" placeholder="3001234567" bind:value={formData.telefono} />
				</label>
				<label class="field">
					<span>Licencia</span>
					<input type="text" placeholder="LIC-123456" bind:value={formData.licencia_conduccion} />
				</label>
				<label class="field">
					<span>Estado</span>
					<select bind:value={formData.estado}>
						<option value="activo">Activo</option>
						<option value="inactivo">Inactivo</option>
					</select>
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
				<h2>Conductores</h2>
			</div>
		</div>

		{#if $conductores.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando conductores...</p>
			</div>
		{:else if $conductores.items.length === 0}
			<div class="empty">
				<p>No hay conductores registrados.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Cédula</th>
							<th>Teléfono</th>
							<th>Licencia</th>
							<th>Estado</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $conductores.items as c}
							<tr>
								<td>{c.nombre}</td>
								<td>{c.cedula}</td>
								<td>{c.telefono || '—'}</td>
								<td>{c.licencia_conduccion || '—'}</td>
								<td>
									<span class={`status-pill status-${estadoClass(c.estado)}`}>
										{estadoLabel(c.estado)}
									</span>
								</td>
								<td class="actions">
									<button class="ghost" on:click={() => editarConductor(c)}>Editar</button>
									{#if c.estado === 'inactivo'}
										<button class="success" on:click={() => solicitarAccion('activar', c)}>Activar</button>
									{:else}
										<button class="danger" on:click={() => solicitarAccion('desactivar', c)}>Desactivar</button>
									{/if}
									<button class="outline" on:click={() => solicitarAccion('eliminar', c)}>Eliminar</button>
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
				<h3>
					{confirmAction.type === 'eliminar'
						? '¿Eliminar conductor?'
						: confirmAction.type === 'desactivar'
						? '¿Desactivar conductor?'
						: '¿Activar conductor?'}
				</h3>
				<p class="lede">
					{confirmAction.type === 'eliminar'
						? 'Se eliminará '
						: confirmAction.type === 'desactivar'
						? 'Se marcará inactivo '
						: 'Se marcará activo '}
					<strong>{confirmAction.label}</strong>.
				</p>
				<div class="modal-actions">
					<button class="ghost" on:click={() => (confirmAction = { open: false, type: null, id: null, label: '' })}>Cancelar</button>
					<button class="danger" on:click={confirmarAccion}>Confirmar</button>
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

	.ghost, .outline, .success, .danger {
		border-radius: 12px;
		padding: 10px 12px;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid #f0d0cb;
		background: #fff;
		color: #a33b36;
		transition: transform 0.12s ease, box-shadow 0.18s ease;
	}
	.ghost:hover, .outline:hover, .success:hover, .danger:hover { transform: translateY(-1px); }
	.outline { color: #4a4a4a; border-color: #e6e6e6; }
	.success { color: #1d5a39; border-color: #cce8d8; background: #f2fcf6; }
	.danger { background: #fff1f1; }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: #3f3f46; }
	.field input, .field select {
		padding: 12px 12px;
		border-radius: 12px;
		border: 1.5px solid #e6e6e9;
		background: #fbfbfc;
		font-size: 14px;
		transition: border-color 0.18s ease, box-shadow 0.18s ease;
		font-family: inherit;
	}
	.field input:focus, .field select:focus {
		outline: none;
		border-color: #e3473c;
		box-shadow: 0 10px 30px rgba(227, 71, 60, 0.12);
		background: #fff;
	}
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; }

	.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid #f1f1f1; box-shadow: 0 12px 32px rgba(0,0,0,0.04); }
	table { width: 100%; border-collapse: collapse; font-size: 14px; }
	thead { background: #fff8f6; }
	thead th { text-align: left; padding: 14px; font-weight: 800; color: #2a2a2a; border-bottom: 1px solid #f0d8d3; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
	tbody td { padding: 14px; border-bottom: 1px solid #f5f5f5; color: #3f3f46; }
	tbody tr:hover { background: #fff4f2; }
	.actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
	.status { padding: 6px 10px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: capitalize; }
	.status.green { background: #f2fcf6; color: #1d5a39; border: 1px solid #cce8d8; }
	.status.red { background: #fff1f1; color: #a33b36; border: 1px solid #f4d5d2; }

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
		tbody td:last-child { padding-top: 8px; }
	}
</style>
