<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores.js';
	import {
		usuarioService,
		vehiculoService,
		conductorService,
		trayectoService,
		clienteService,
		rolService
	} from '../lib/api/services.js';
	import { authService } from '$lib/api/services.js';
	import { puedeAccion } from '$lib/permisos.js';
	import { MODULOS as MODULOS_APP, modulosConfig } from '$lib/modulos.js';

	// En el sistema existen 10 módulos (incluye `modulos`), pero el sidebar muestra 9 opciones
	// porque el menú no incluye el módulo de configuración `modulos`.
	const SIDEBAR_MODULOS = [
		'dashboard',
		'usuarios',
		'clientes',
		'vehiculos',
		'conductores',
		'trayectos',
		'asignaciones',
		'roles',
		'registroHoras'
	];

	const MODULE_META = {
		dashboard: {
			label: 'Dashboard',
			icon: 'home',
			path: '/',
			description: 'Visión general y métricas clave.'
		},
		usuarios: {
			label: 'Usuarios',
			icon: 'group',
			path: '/usuarios',
			description: 'Administra usuarios, roles y estados.'
		},
		clientes: {
			label: 'Clientes',
			icon: 'apartment',
			path: '/clientes',
			description: 'Gestiona clientes y su estado.'
		},
		roles: {
			label: 'Roles',
			icon: 'admin_panel_settings',
			path: '/roles',
			description: 'Define roles y permisos por rol.'
		},
		modulos: {
			label: 'Módulos',
			icon: 'tune',
			path: '/modulos',
			description: 'Configura visibilidad y acciones por rol.'
		},
		vehiculos: {
			label: 'Vehículos',
			icon: 'local_shipping',
			path: '/vehiculos',
			description: 'Control de flota, documentos y estados.'
		},
		conductores: {
			label: 'Conductores',
			icon: 'badge',
			path: '/conductores',
			description: 'Gestión de conductores, alertas y estados.'
		},
		trayectos: {
			label: 'Trayectos',
			icon: 'map',
			path: '/trayectos',
			description: 'Rutas, planificación y operación.'
		},
		asignaciones: {
			label: 'Asignaciones',
			icon: 'route',
			path: '/asignaciones',
			description: 'Asigna trayectos a vehículos y conductores.'
		},
		registroHoras: {
			label: 'Registro de Horas',
			icon: 'schedule',
			path: '/operaciones/horas',
			description: 'Registra horas de conducción por conductor.'
		}
	};

	let dataset = {
		usuarios: [],
		clientes: [],
		roles: [],
		vehiculos: [],
		conductores: [],
		trayectos: [],
		asignaciones: []
	};

	let totals = {
		usuarios: 0,
		clientes: 0,
		roles: 0,
		vehiculos: 0,
		conductores: 0,
		trayectos: 0,
		asignaciones: 0,
		modulos: SIDEBAR_MODULOS.length
	};

	let percents = {
		usuariosActivos: 0,
		clientesActivos: 0,
		vehiculosOperativos: 0,
		vehiculosEnRuta: 0,
		conductoresNoInactivos: 0,
		conductoresEnRuta: 0,
		trayectosAsignados: 0,
		modulosHabilitados: 0
	};
	let modulosHabilitadosPct = 0;
	let modulosHabilitadosCount = 0;

	let indicatorCards = [];
	let chartCards = [];
	let loading = true;

	const lower = (value) => String(value ?? '').toLowerCase();
	const pct = (part, total) => {
		const p = Number(part) || 0;
		const t = Number(total) || 0;
		if (t <= 0) return 0;
		return Math.max(0, Math.min(100, Math.round((p / t) * 100)));
	};
	const countWhere = (items, predicate) => {
		if (!Array.isArray(items) || typeof predicate !== 'function') return 0;
		let count = 0;
		for (const item of items) {
			if (predicate(item)) count += 1;
		}
		return count;
	};

	$: rolActual = $auth?.usuario?.nombre_rol ? String($auth.usuario.nombre_rol).toUpperCase() : null;
	$: cfgRol = rolActual ? $modulosConfig?.[rolActual] : null;
	$: {
		// Porcentaje de módulos habilitados (sidebar + ver) para el rol actual.
		const habilitados = cfgRol
			? SIDEBAR_MODULOS.filter((m) => cfgRol?.[m]?.sidebar === true && cfgRol?.[m]?.acciones?.ver === true)
			: [];
		modulosHabilitadosCount = habilitados.length;
		modulosHabilitadosPct = pct(habilitados.length, SIDEBAR_MODULOS.length);
	}

	onMount(async () => {
		// Si no puede ver dashboard, intentar redirigir al primer módulo accesible
		if (!puedeAccion('dashboard', 'ver') && puedeAccion('registroHoras', 'ver')) {
			goto('/operaciones/horas', { replaceState: true });
			return;
		}

		// Verificar que haya token antes de cargar datos
		const token = authService.getToken();
		
		if (!token) {
			loading = false;
			return;
		}

		try {
			const puedeVerConductores = puedeAccion('conductores', 'ver') || puedeAccion('registroHoras', 'ver');
			const tareas = [
				puedeAccion('usuarios', 'ver') ? usuarioService.listar() : Promise.resolve(null),
				puedeAccion('clientes', 'ver') ? clienteService.listar() : Promise.resolve(null),
				puedeAccion('roles', 'ver') ? rolService.listar() : Promise.resolve(null),
				puedeAccion('vehiculos', 'ver') ? vehiculoService.listar() : Promise.resolve(null),
				puedeVerConductores ? conductorService.listar() : Promise.resolve(null),
				puedeAccion('trayectos', 'ver') ? trayectoService.listar() : Promise.resolve(null),
				puedeAccion('asignaciones', 'ver') ? trayectoService.listarAsignaciones() : Promise.resolve(null)
			];

			const [usuariosRes, clientesRes, rolesRes, vehiculosRes, conductoresRes, trayectosRes, asignacionesRes] =
				await Promise.all(tareas);

			dataset = {
				usuarios: usuariosRes?.usuarios || [],
				clientes: clientesRes?.clientes || [],
				roles: rolesRes?.roles || [],
				vehiculos: vehiculosRes?.vehiculos || [],
				conductores: conductoresRes?.conductores || [],
				trayectos: trayectosRes?.trayectos || [],
				asignaciones: asignacionesRes?.asignaciones || []
			};

			totals = {
				usuarios: dataset.usuarios.length,
				clientes: dataset.clientes.length,
				roles: dataset.roles.length,
				vehiculos: dataset.vehiculos.length,
				conductores: dataset.conductores.length,
				trayectos: dataset.trayectos.length,
				asignaciones: dataset.asignaciones.length,
				modulos: SIDEBAR_MODULOS.length
			};

			const usuariosActivos = countWhere(dataset.usuarios, (u) => lower(u?.estado) === 'activo');
			const clientesActivos = countWhere(dataset.clientes, (c) => lower(c?.estado) === 'activo');
			const vehiculosOperativos = countWhere(dataset.vehiculos, (v) => lower(v?.estado_operativo) === 'operativo');
			const vehiculosEnRuta = countWhere(dataset.vehiculos, (v) => lower(v?.estado_operativo) === 'en_ruta');
			const conductoresNoInactivos = countWhere(dataset.conductores, (c) => lower(c?.estado) !== 'inactivo');
			const conductoresEnRuta = countWhere(dataset.conductores, (c) => lower(c?.estado) === 'en_ruta');
			const trayectosAsignados = pct(totals.asignaciones, totals.trayectos);

			percents = {
				usuariosActivos: pct(usuariosActivos, totals.usuarios),
				clientesActivos: pct(clientesActivos, totals.clientes),
				vehiculosOperativos: pct(vehiculosOperativos, totals.vehiculos),
				vehiculosEnRuta: pct(vehiculosEnRuta, totals.vehiculos),
				conductoresNoInactivos: pct(conductoresNoInactivos, totals.conductores),
				conductoresEnRuta: pct(conductoresEnRuta, totals.conductores),
				trayectosAsignados,
				modulosHabilitados: modulosHabilitadosPct
			};
		} catch (error) {
			console.error('Error cargando estadísticas:', error);
		}
		loading = false;
	});

	$: {
		const cards = MODULOS_APP.filter((m) => m !== 'dashboard').map((modulo) => {
			const meta = MODULE_META[modulo] || { label: modulo, icon: 'apps', path: '/' };
			const sinAcceso = !puedeAccion(modulo, 'ver');
			let value = '—';
			let percentValue = null;
			let percentLabel = '';

			if (modulo === 'usuarios') {
				value = totals.usuarios;
				percentValue = percents.usuariosActivos;
				percentLabel = 'activos';
			} else if (modulo === 'clientes') {
				value = totals.clientes;
				percentValue = percents.clientesActivos;
				percentLabel = 'activos';
			} else if (modulo === 'roles') {
				value = totals.roles;
			} else if (modulo === 'modulos') {
				value = totals.modulos;
				percentValue = modulosHabilitadosPct;
				percentLabel = 'habilitados';
			} else if (modulo === 'vehiculos') {
				value = totals.vehiculos;
				percentValue = percents.vehiculosOperativos;
				percentLabel = 'operativos';
			} else if (modulo === 'conductores') {
				value = totals.conductores;
				percentValue = percents.conductoresNoInactivos;
				percentLabel = 'disponibles';
			} else if (modulo === 'trayectos') {
				value = totals.trayectos;
				percentValue = percents.trayectosAsignados;
				percentLabel = 'asignados';
			} else if (modulo === 'asignaciones') {
				value = totals.asignaciones;
				percentValue = percents.vehiculosEnRuta;
				percentLabel = 'flota en ruta';
			} else if (modulo === 'registroHoras') {
				// No hay endpoint dedicado de “horas” para un total global; usamos conductores como base del módulo.
				value = totals.conductores;
				percentValue = percents.conductoresEnRuta;
				percentLabel = 'conductores en ruta';
			}

			return {
				modulo,
				label: meta.label,
				icon: meta.icon,
				path: meta.path,
				description: meta.description,
				value,
				percentValue,
				percentLabel,
				disabled: sinAcceso
			};
		});

		indicatorCards = cards;

		chartCards = [
			{
				key: 'usuarios',
				title: 'Usuarios activos',
				subtitle: `${totals.usuarios} usuarios`,
				percent: percents.usuariosActivos,
				ring: 'var(--tc-success-text)'
			},
			{
				key: 'clientes',
				title: 'Clientes activos',
				subtitle: `${totals.clientes} clientes`,
				percent: percents.clientesActivos,
				ring: 'var(--tc-success-text)'
			},
			{
				key: 'vehiculos',
				title: 'Vehículos operativos',
				subtitle: `${totals.vehiculos} vehículos`,
				percent: percents.vehiculosOperativos,
				ring: 'var(--tc-accent)'
			},
			{
				key: 'enRuta',
				title: 'Flota en ruta',
				subtitle: `${totals.vehiculos} vehículos`,
				percent: percents.vehiculosEnRuta,
				ring: 'var(--tc-accent-2)'
			},
			{
				key: 'trayectos',
				title: 'Trayectos asignados',
				subtitle: `${totals.asignaciones} asignaciones`,
				percent: percents.trayectosAsignados,
				ring: 'var(--tc-accent-2)'
			},
			{
				key: 'modulos',
				title: 'Módulos habilitados',
				subtitle: rolActual
					? `${modulosHabilitadosCount} de ${SIDEBAR_MODULOS.length} (rol ${rolActual})`
					: `${SIDEBAR_MODULOS.length} módulos`,
				percent: modulosHabilitadosPct,
				ring: 'var(--tc-warning-text)'
			}
		];
	}
</script>

<svelte:head>
	<title>Dashboard - TransConecta</title>
</svelte:head>

<div class="page-shell">
	<div class="bg-shape shape-a" aria-hidden="true"></div>
	<div class="bg-shape shape-b" aria-hidden="true"></div>

	<section class="hero">
		<div class="hero-text">
			<p class="eyebrow">Panel operativo</p>
			<h1>Bienvenido a TransConecta</h1>
			<p class="lede">Opera tu red de transporte con visibilidad, seguridad y control en tiempo real.</p>
			<div class="hero-meta">
				<span class="chip success">
					<span class="dot"></span>
					Sesión activa
				</span>
				<span class="chip soft">Datos actualizados</span>
			</div>
		</div>

		<div class="hero-card">
			<p class="label">Resumen rápido</p>
			<div class="hero-stats">
				<div class="mini-stat">
					<span>Usuarios</span>
					<strong>{loading ? '—' : totals.usuarios}</strong>
				</div>
				<div class="mini-stat">
					<span>Vehículos</span>
					<strong>{loading ? '—' : totals.vehiculos}</strong>
				</div>
				<div class="mini-stat">
					<span>Asignaciones</span>
					<strong>{loading ? '—' : totals.asignaciones}</strong>
				</div>
			</div>
			<p class="hint">Monitorea tu operación y accede rápido a cada módulo.</p>
		</div>
	</section>

	{#if loading}
		<div class="loading">
			<div class="spinner" aria-hidden="true"></div>
			<p>Cargando estadísticas...</p>
		</div>
	{:else}
		<section class="section">
			<div class="section-head">
				<div>
					<p class="label">Indicadores</p>
					<h2>Métricas clave</h2>
					<p class="section-lede">Indicadores por módulo: totales y porcentajes operativos.</p>
				</div>
			</div>

			<div class="stats-grid">
				{#each indicatorCards as card (card.modulo)}
					<div class="stat-card" class:disabled={card.disabled} aria-label={card.label}>
						<div class="stat-icon"><span class="ms-icon">{card.icon}</span></div>
						<div class="stat-body">
							<p class="stat-label">{card.label}</p>
							<p class="stat-value">{card.value}</p>
							{#if card.percentValue !== null && card.percentValue !== undefined}
								<p class="stat-sub">{card.percentValue}% {card.percentLabel}</p>
								<div class="mini-bar" aria-hidden="true">
									<span style={`width: ${card.percentValue}%`}></span>
								</div>
							{:else}
								<p class="stat-sub muted">{card.disabled ? 'Sin acceso' : '—'}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="section">
			<div class="section-head">
				<div>
					<p class="label">Control</p>
					<h2>Gráficos de porcentaje</h2>
					<p class="section-lede">Lectura rápida de salud operacional por módulo.</p>
				</div>
			</div>

			<div class="charts-grid">
				{#each chartCards as chart (chart.key)}
					<div class="chart-card" style={`--ring: ${chart.ring};`}>
						<div class="donut" aria-hidden="true">
							<svg viewBox="0 0 42 42" class="donut-svg">
								<circle class="donut-bg" cx="21" cy="21" r="15.915" fill="transparent" />
								<circle
									class="donut-fg"
									cx="21"
									cy="21"
									r="15.915"
									fill="transparent"
									stroke-dasharray={`${chart.percent} ${100 - chart.percent}`}
									stroke-dashoffset="25"
								/>
							</svg>
							<div class="donut-center">
								<span class="donut-value">{chart.percent}%</span>
							</div>
						</div>
						<div class="chart-body">
							<p class="chart-title">{chart.title}</p>
							<p class="chart-subtitle">{chart.subtitle}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="section">
			<div class="section-head">
				<div>
					<p class="label">Módulos</p>
					<h2>Todos los módulos</h2>
					<p class="section-lede">Listado completo de capacidades de la aplicación (según permisos del rol).</p>
				</div>
			</div>

			<div class="features-grid">
				{#each indicatorCards as m (m.modulo)}
					<div class="feature-card" class:disabled={m.disabled} aria-label={m.label}>
						<div class="feature-icon"><span class="ms-icon">{m.icon}</span></div>
						<div>
							<div class="feature-title-row">
								<h4>{m.label}</h4>
								<span class="feature-chip" class:locked={m.disabled}>
									{m.disabled ? 'Sin acceso' : 'Disponible'}
								</span>
							</div>
							<p>{m.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.page-shell {
		position: relative;
		width: 100%;
		padding: 28px 26px 60px 26px;
		box-sizing: border-box;
		overflow: hidden;
		font-family: var(--tc-font);
		color: var(--tc-text);
	}

	.bg-shape {
		position: absolute;
		border-radius: 999px;
		filter: blur(90px);
		opacity: 0.28;
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
		width: 380px;
		height: 380px;
		background: color-mix(in srgb, var(--tc-accent-2), transparent 80%);
		bottom: -160px;
		right: -100px;
	}
	:global(html[data-theme='dark']) .page-shell .bg-shape { opacity: 0.18; }

	.hero {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 22px;
		padding: 28px;
		border-radius: 18px;
		background: linear-gradient(125deg, var(--tc-surface) 0%, var(--tc-surface-2) 100%);
		border: 1px solid var(--tc-border);
		box-shadow: var(--tc-shadow);
		margin-bottom: 26px;
	}

	.hero-text h1 {
		margin: 6px 0 8px 0;
		font-size: 32px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--tc-text);
	}

	.eyebrow {
		margin: 0;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--tc-accent-2);
		font-weight: 700;
	}

	.lede {
		margin: 0;
		font-size: 15px;
		color: var(--tc-text-muted);
		max-width: 640px;
		line-height: 1.5;
	}

	.hero-meta {
		display: flex;
		gap: 10px;
		margin-top: 14px;
		flex-wrap: wrap;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 700;
		background: var(--tc-surface-3);
		color: var(--tc-accent-2);
		border: 1px solid var(--tc-border-strong);
	}

	.chip.soft {
		background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 40%);
		color: var(--tc-text-muted);
		border-color: var(--tc-border);
	}

	.chip .dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--tc-success-text);
		box-shadow: 0 0 0 6px color-mix(in srgb, var(--tc-success-text), transparent 84%);
	}

	.hero-card {
		align-self: center;
		background: linear-gradient(135deg, var(--tc-surface), var(--tc-surface-2));
		border-radius: 14px;
		padding: 18px;
		border: 1px solid var(--tc-border-strong);
		box-shadow: var(--tc-shadow);
		display: grid;
		gap: 12px;
	}

	.label {
		margin: 0;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--tc-text-muted);
		font-weight: 700;
	}

	.hero-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid var(--tc-border);
		background: color-mix(in srgb, var(--tc-surface-2), var(--tc-surface) 55%);
	}

	.mini-stat {
		display: grid;
		align-content: start;
		gap: 6px;
		padding: 12px 14px;
		font-size: 13px;
		color: var(--tc-text-muted);
	}

	.mini-stat:not(:first-child) {
		border-left: 1px solid var(--tc-border);
	}

	.mini-stat span {
		font-weight: 700;
	}

	.mini-stat strong {
		font-size: 24px;
		line-height: 1;
		font-weight: 900;
		color: var(--tc-accent);
	}

	.hint {
		margin: 0;
		font-size: 13px;
		color: var(--tc-text-muted);
	}

	.section {
		position: relative;
		z-index: 1;
		background: var(--tc-surface);
		border-radius: 16px;
		padding: 20px 22px;
		border: 1px solid var(--tc-border);
		box-shadow: var(--tc-shadow);
		margin-bottom: 18px;
	}

	.section-head h2 {
		margin: 4px 0 6px 0;
		font-size: 22px;
		font-weight: 800;
		color: var(--tc-text);
	}

	.section-lede {
		margin: 0;
		color: var(--tc-text-muted);
		font-size: 14px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
		margin-top: 12px;
	}

	.stat-card {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-radius: 14px;
		background: linear-gradient(135deg, var(--tc-surface), var(--tc-surface-2));
		border: 1px solid var(--tc-border);
		color: inherit;
		transition: box-shadow 0.2s ease;
		box-shadow: var(--tc-shadow);
	}

	.stat-card:hover {
		box-shadow: 0 14px 34px color-mix(in srgb, var(--tc-accent), transparent 82%);
	}

	.stat-icon {
		font-size: 26px;
		background: var(--tc-surface-3);
		border-radius: 12px;
		padding: 10px;
		border: 1px solid var(--tc-border-strong);
	}

	.stat-icon .ms-icon {
		font-size: 24px;
		color: var(--tc-accent-2);
	}

	.stat-body {
		display: grid;
		gap: 4px;
	}

	.stat-label {
		margin: 0;
		color: var(--tc-text-muted);
		font-size: 14px;
		font-weight: 600;
	}

	.stat-value {
		margin: 0;
		font-size: 24px;
		font-weight: 800;
		color: var(--tc-accent);
	}

	.stat-sub {
		margin: 0;
		font-size: 12px;
		font-weight: 700;
		color: var(--tc-text-muted);
	}

	.stat-sub.muted {
		color: color-mix(in srgb, var(--tc-text-muted), transparent 15%);
	}

	.mini-bar {
		height: 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--tc-border), transparent 5%);
		border: 1px solid var(--tc-border);
		overflow: hidden;
		margin-top: 4px;
	}

	.mini-bar span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--tc-accent), var(--tc-accent-2));
		border-radius: 999px;
	}

	.stat-card.disabled {
		opacity: 0.75;
		cursor: default;
	}

	.stat-card.disabled:hover {
		transform: none;
		box-shadow: var(--tc-shadow);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 14px;
		margin-top: 14px;
	}

	.feature-card {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
		border-radius: 14px;
		background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%);
		border: 1px solid var(--tc-border);
		transition: transform 0.12s ease, box-shadow 0.18s ease, border-color 0.18s ease;
		cursor: default;
		text-align: left;
		width: 100%;
	}

	.feature-card.disabled,
	.feature-card:disabled {
		opacity: 0.75;
		cursor: not-allowed;
	}

	.feature-card:hover {
		transform: translateY(-1px);
		border-color: var(--tc-border-strong);
		box-shadow: var(--tc-shadow);
	}

	.feature-icon {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--tc-surface-3);
		border: 1px solid var(--tc-border-strong);
		display: grid;
		place-items: center;
		font-size: 20px;
	}

	.feature-icon .ms-icon {
		font-size: 22px;
		color: var(--tc-accent-2);
	}

	.feature-card h4 {
		margin: 0 0 6px 0;
		font-size: 16px;
		font-weight: 800;
		color: var(--tc-text);
	}

	.feature-card p {
		margin: 0;
		color: var(--tc-text-muted);
		font-size: 14px;
		line-height: 1.45;
	}

	.feature-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 6px;
	}

	.feature-title-row h4 {
		margin: 0;
	}

	.feature-chip {
		padding: 6px 10px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 800;
		border: 1px solid var(--tc-success-border);
		background: var(--tc-success-bg);
		color: var(--tc-success-text);
		white-space: nowrap;
	}

	.feature-chip.locked {
		border-color: var(--tc-border);
		background: color-mix(in srgb, var(--tc-surface), var(--tc-bg) 35%);
		color: var(--tc-text-muted);
	}

	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
		margin-top: 14px;
	}

	.chart-card {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 14px;
		align-items: center;
		padding: 16px;
		border-radius: 14px;
		border: 1px solid var(--tc-border);
		background: linear-gradient(135deg, var(--tc-surface), var(--tc-surface-2));
		box-shadow: var(--tc-shadow);
	}

	.donut {
		position: relative;
		width: 74px;
		height: 74px;
		display: grid;
		place-items: center;
	}

	.donut-svg {
		width: 74px;
		height: 74px;
		transform: rotate(-90deg);
	}

	.donut-bg {
		stroke: color-mix(in srgb, var(--tc-border), transparent 10%);
		stroke-width: 5.5;
	}

	.donut-fg {
		stroke: var(--ring);
		stroke-width: 5.5;
		stroke-linecap: round;
	}

	.donut-center {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.donut-value {
		font-weight: 900;
		font-size: 14px;
		color: var(--tc-text);
	}

	.chart-title {
		margin: 0;
		font-weight: 900;
		font-size: 14px;
		color: var(--tc-text);
	}

	.chart-subtitle {
		margin: 4px 0 0 0;
		font-size: 12px;
		color: var(--tc-text-muted);
		font-weight: 700;
	}

	.loading {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		gap: 12px;
		padding: 60px;
		color: var(--tc-text-muted);
		font-weight: 600;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 4px solid color-mix(in srgb, var(--tc-accent), transparent 82%);
		border-top-color: var(--tc-accent);
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.hero-card {
			order: 2;
		}
	}

	@media (max-width: 640px) {
		.page-shell {
			padding: 18px 16px 40px 16px;
		}

		.hero {
			padding: 20px;
		}

		.hero-stats {
			grid-template-columns: 1fr;
		}

		.mini-stat:not(:first-child) {
			border-left: none;
			border-top: 1px solid var(--tc-border);
		}

		.stat-card {
			grid-template-columns: auto 1fr;
		}

	}
</style>
