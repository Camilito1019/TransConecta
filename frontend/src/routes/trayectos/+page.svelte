<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { trayectos, addNotificacion } from '$lib/stores.js';
	import { trayectoService } from '$lib/api/services.js';
	import { puedeCrear, puedeEditar, puedeEliminar, puedeVerModulo } from '$lib/permisos.js';
	import { modulosConfig } from '$lib/modulos.js';
	import { scrollToTop } from '$lib/scroll.js';

	let mostrarFormulario = false;
	let editandoId = null;
	let confirmAction = { open: false, id: null, label: '' };
	let formData = { origen: '', destino: '', distancia_km: '', tiempo_estimado: '' };

	const MODULO = 'trayectos';

	let puedeCrearTrayectos = false;
	let puedeEditarTrayectos = false;
	let puedeEliminarTrayectos = false;

	$: permisosModulo = $modulosConfig;
	$: {
		permisosModulo;
		puedeCrearTrayectos = puedeCrear(MODULO);
		puedeEditarTrayectos = puedeEditar(MODULO);
		puedeEliminarTrayectos = puedeEliminar(MODULO);
	}

	onMount(async () => {
		if (!puedeVerModulo(MODULO)) {
			addNotificacion('No tienes acceso al módulo Trayectos', 'error');
			goto('/');
			return;
		}
		await cargarTrayectos();
	});

	async function cargarTrayectos() {
		trayectos.update((t) => ({ ...t, loading: true }));
		try {
			const data = await trayectoService.listar();
			trayectos.update((t) => ({ ...t, items: data.trayectos || [], loading: false }));
		} catch (error) {
			trayectos.update((t) => ({ ...t, error: error.message, loading: false }));
			addNotificacion(error.message, 'error');
		}
	}

	function resetForm() {
		editandoId = null;
		formData = { origen: '', destino: '', distancia_km: '', tiempo_estimado: '' };
	}

	async function abrirFormulario() {
		resetForm();
		mostrarFormulario = true;
		await tick();
		scrollToTop();
	}

	async function editarTrayecto(trayecto) {
		editandoId = trayecto.id_trayecto;
		formData = {
			origen: trayecto.origen,
			destino: trayecto.destino,
			distancia_km: trayecto.distancia_km,
			tiempo_estimado: trayecto.tiempo_estimado
		};
		mostrarFormulario = true;
		await tick();
		scrollToTop();
	}

	async function guardarTrayecto() {
		if (!formData.origen || !formData.destino || !formData.distancia_km || !formData.tiempo_estimado) {
			addNotificacion('Completa todos los campos', 'warning');
			return;
		}
		const payload = {
			origen: formData.origen,
			destino: formData.destino,
			distancia_km: Number(formData.distancia_km),
			tiempo_estimado: Number(formData.tiempo_estimado)
		};
		try {
			if (editandoId) {
				await trayectoService.actualizar(editandoId, payload);
				addNotificacion('Trayecto actualizado', 'success');
			} else {
				await trayectoService.crear(payload);
				addNotificacion('Trayecto creado', 'success');
			}
			mostrarFormulario = false;
			await cargarTrayectos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	function solicitarEliminar(trayecto) {
		confirmAction = { open: true, id: trayecto.id_trayecto, label: `${trayecto.origen} → ${trayecto.destino}` };
	}

	async function confirmarEliminar() {
		if (!confirmAction.id) return;
		try {
			await trayectoService.eliminar(confirmAction.id);
			addNotificacion('Trayecto eliminado', 'success');
			confirmAction = { open: false, id: null, label: '' };
			await cargarTrayectos();
		} catch (error) {
			addNotificacion(error.message, 'error');
		}
	}

	$: stats = {
		total: $trayectos.items.length,
		distanciaTotal: $trayectos.items.reduce((acc, t) => acc + Number(t.distancia_km || 0), 0)
	};

</script>

<svelte:head>
	<title>Gestión de Trayectos - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Rutas</p>
			<h1>Gestión de Trayectos</h1>
			<p class="lede">Define rutas con origen, destino, distancia y tiempo estimado.</p>
			<div class="chips">
				<span class="chip success">{stats.total} trayectos</span>
				<span class="chip muted">{stats.distanciaTotal.toFixed(1)} km totales</span>
			</div>
		</div>
		<div class="hero-actions">
			{#if puedeCrearTrayectos}
				<button class="primary" on:click={abrirFormulario}>+ Nuevo trayecto</button>
			{/if}
		</div>
	</section>

	{#if mostrarFormulario}
		<section class="panel">
			<div class="panel-head">
				<div>
					<p class="label">Formulario</p>
					<h2>{editandoId ? 'Editar trayecto' : 'Nuevo trayecto'}</h2>
				</div>
				<button class="ghost" on:click={() => (mostrarFormulario = false)}>Cerrar</button>
			</div>
			<form class="form-grid" on:submit|preventDefault={guardarTrayecto}>
				<label class="field">
					<span>Origen</span>
					<input type="text" placeholder="Ciudad origen" bind:value={formData.origen} required />
				</label>
				<label class="field">
					<span>Destino</span>
					<input type="text" placeholder="Ciudad destino" bind:value={formData.destino} required />
				</label>
				<label class="field">
					<span>Distancia (km)</span>
					<input type="number" min="0" step="0.1" placeholder="0" bind:value={formData.distancia_km} required />
				</label>
				<label class="field">
					<span>Tiempo estimado (h)</span>
					<input type="number" min="0" step="0.1" placeholder="0" bind:value={formData.tiempo_estimado} required />
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
				<h2>Trayectos</h2>
			</div>
		</div>

		{#if $trayectos.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Cargando trayectos...</p>
			</div>
		{:else if $trayectos.items.length === 0}
			<div class="empty">
				<p>No hay trayectos registrados.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Origen</th>
							<th>Destino</th>
							<th>Distancia</th>
							<th>Tiempo</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each $trayectos.items as r}
							<tr>
								<td>{r.origen}</td>
								<td>{r.destino}</td>
								<td>{r.distancia_km} km</td>
							<td>{r.tiempo_estimado} h</td>
							<td class="actions">
								{#if puedeEditarTrayectos}
									<button class="ghost" on:click={() => editarTrayecto(r)}>Editar</button>
								{/if}
								{#if puedeEliminarTrayectos}
									<button class="outline" on:click={() => solicitarEliminar(r)}>Eliminar</button>
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
				<h3>¿Eliminar trayecto?</h3>
				<p class="lede">Se eliminará <strong>{confirmAction.label}</strong>.</p>
				<div class="modal-actions">
					<button class="ghost" on:click={() => (confirmAction = { open: false, id: null, label: '' })}>Cancelar</button>
					<button class="danger" on:click={confirmarEliminar}>Confirmar</button>
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
	.lede { margin: 0; color: var(--tc-text-muted); font-size: 14px; max-width: 540px; }
	.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
	.chip { padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; border: 1px solid var(--tc-border-strong); background: var(--tc-surface-3); color: var(--tc-accent-2); }
	.chip.muted { background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 40%); border-color: var(--tc-border); color: var(--tc-text-muted); }
	.chip.success { background: var(--tc-success-bg); border-color: var(--tc-success-border); color: var(--tc-success-text); }

	.hero-actions { display: flex; gap: 10px; }
	.primary { background: linear-gradient(135deg, var(--tc-accent), var(--tc-accent-2)); color: var(--tc-on-accent); border: 1px solid color-mix(in srgb, var(--tc-accent), var(--tc-border) 55%); border-radius: 12px; padding: 10px 14px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 26px color-mix(in srgb, var(--tc-accent), transparent 75%); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.primary:hover { transform: translateY(-1px); box-shadow: 0 16px 30px color-mix(in srgb, var(--tc-accent), transparent 70%); }
	.primary:active { transform: translateY(0); box-shadow: 0 10px 22px color-mix(in srgb, var(--tc-accent), transparent 78%); }

	.panel { position: relative; z-index: 1; background: var(--tc-surface); border-radius: 16px; border: 1px solid var(--tc-border); box-shadow: var(--tc-shadow); padding: 18px 18px 22px 18px; margin-bottom: 16px; }
	.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
	.label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: var(--tc-text-muted); margin: 0; font-weight: 800; }
	.panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

	.ghost, .outline, .danger { border-radius: 12px; padding: 10px 12px; font-weight: 700; cursor: pointer; border: 1px solid var(--tc-border); background: var(--tc-surface); color: var(--tc-accent-2); transition: transform 0.12s ease, box-shadow 0.18s ease; }
	.ghost:hover, .outline:hover, .danger:hover { transform: translateY(-1px); }
	.outline { color: var(--tc-text); border-color: var(--tc-border-strong); }
	.danger { color: var(--tc-danger-text); border-color: var(--tc-danger-border); background: var(--tc-danger-bg); }

	.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 14px; }
	.field { display: grid; gap: 6px; font-size: 14px; color: var(--tc-text); }
	.field input { padding: 12px 12px; border-radius: 12px; border: 1.5px solid var(--tc-border); background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%); font-size: 14px; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; font-family: inherit; }
	.field input:focus { outline: none; border-color: var(--tc-accent); box-shadow: 0 10px 30px color-mix(in srgb, var(--tc-accent), transparent 85%); background: var(--tc-surface); }
	.form-actions { grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px; justify-content: flex-end; }

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
	}
</style>
