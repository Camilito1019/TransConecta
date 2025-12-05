<script>
	import { onMount } from 'svelte';
	import { usuarioService, vehiculoService, conductorService, trayectoService } from '../lib/api/services.js';

	let stats = {
		usuarios: 0,
		vehiculos: 0,
		conductores: 0,
		trayectos: 0
	};
	let loading = true;

	onMount(async () => {
		try {
			const [usuarios, vehiculos, conductores, trayectos] = await Promise.all([
				usuarioService.listar(),
				vehiculoService.listar(),
				conductorService.listar(),
				trayectoService.listar()
			]);

			stats = {
				usuarios: usuarios.usuarios?.length || 0,
				vehiculos: vehiculos.vehiculos?.length || 0,
				conductores: conductores.conductores?.length || 0,
				trayectos: trayectos.trayectos?.length || 0
			};
		} catch (error) {
			console.error('Error cargando estadísticas:', error);
		}
		loading = false;
	});
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
					<strong>{loading ? '—' : stats.usuarios}</strong>
				</div>
				<div class="divider"></div>
				<div class="mini-stat">
					<span>Vehículos</span>
					<strong>{loading ? '—' : stats.vehiculos}</strong>
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
					<p class="section-lede">Tu snapshot operativo: usuarios, flota, conductores y rutas en marcha.</p>
				</div>
			</div>

			<div class="stats-grid">
				<div class="stat-card" aria-label="Usuarios">
					<div class="stat-icon"><span class="ms-icon">group</span></div>
					<div class="stat-body">
						<p class="stat-label">Usuarios</p>
						<p class="stat-value">{stats.usuarios}</p>
					</div>
				</div>

				<div class="stat-card" aria-label="Vehículos">
					<div class="stat-icon"><span class="ms-icon">local_shipping</span></div>
					<div class="stat-body">
						<p class="stat-label">Vehículos</p>
						<p class="stat-value">{stats.vehiculos}</p>
					</div>
				</div>

				<div class="stat-card" aria-label="Conductores">
					<div class="stat-icon"><span class="ms-icon">badge</span></div>
					<div class="stat-body">
						<p class="stat-label">Conductores</p>
						<p class="stat-value">{stats.conductores}</p>
					</div>
				</div>

				<div class="stat-card" aria-label="Trayectos">
					<div class="stat-icon"><span class="ms-icon">map</span></div>
					<div class="stat-body">
						<p class="stat-label">Trayectos</p>
						<p class="stat-value">{stats.trayectos}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="section-head">
				<div>
					<p class="label">Módulos</p>
					<h2>Capacidades principales</h2>
					<p class="section-lede">Accede a los pilares del sistema y mantén la operación al día.</p>
				</div>
			</div>

			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon"><span class="ms-icon">person</span></div>
					<div>
						<h4>Gestión de Usuarios</h4>
						<p>Crea, edita y administra usuarios con roles y permisos específicos.</p>
					</div>
				</div>

				<div class="feature-card">
					<div class="feature-icon"><span class="ms-icon">local_shipping</span></div>
					<div>
						<h4>Gestión de Vehículos</h4>
						<p>Registra y controla la flota con documentos, historial y estado operativo.</p>
					</div>
				</div>

				<div class="feature-card">
					<div class="feature-icon"><span class="ms-icon">badge</span></div>
					<div>
						<h4>Gestión de Conductores</h4>
						<p>Monitorea horas de conducción, alertas de fatiga y estado de conductores.</p>
					</div>
				</div>

				<div class="feature-card">
					<div class="feature-icon"><span class="ms-icon">map</span></div>
					<div>
						<h4>Gestión de Trayectos</h4>
						<p>Crea rutas, asigna vehículos y conductores con seguimiento en tiempo real.</p>
					</div>
				</div>

				<div class="feature-card">
					<div class="feature-icon"><span class="ms-icon">route</span></div>
					<div>
						<h4>Asignaciones</h4>
						<p>Coordina la asignación de trayectos a vehículos y conductores.</p>
					</div>
				</div>

				<div class="feature-card">
					<div class="feature-icon"><span class="ms-icon">insert_chart_outlined</span></div>
					<div>
						<h4>Reportes</h4>
						<p>Visualiza estadísticas y métricas de operación del sistema.</p>
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

	.page-shell {
		position: relative;
		width: 100%;
		padding: 28px 26px 60px 26px;
		box-sizing: border-box;
		overflow: hidden;
		font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
		color: #1f1f1f;
	}

	.bg-shape {
		position: absolute;
		border-radius: 999px;
		filter: blur(90px);
		opacity: 0.35;
		z-index: 0;
	}

	.shape-a {
		width: 420px;
		height: 420px;
		background: #f6c3c3;
		top: -140px;
		left: -120px;
	}

	.shape-b {
		width: 380px;
		height: 380px;
		background: #ffd8cf;
		bottom: -160px;
		right: -100px;
	}

	.hero {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 22px;
		padding: 28px;
		border-radius: 18px;
		background: linear-gradient(125deg, #ffffff 0%, #fff4f2 100%);
		border: 1px solid #f0d8d3;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.06);
		margin-bottom: 26px;
	}

	.hero-text h1 {
		margin: 6px 0 8px 0;
		font-size: 32px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #262626;
	}

	.eyebrow {
		margin: 0;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #a33b36;
		font-weight: 700;
	}

	.lede {
		margin: 0;
		font-size: 15px;
		color: #525252;
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
		background: #fff1f1;
		color: #a33b36;
		border: 1px solid #f4d5d2;
	}

	.chip.soft {
		background: #fafafa;
		color: #3f3f46;
		border-color: #ededed;
	}

	.chip .dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #2ecc71;
		box-shadow: 0 0 0 6px rgba(46, 204, 113, 0.16);
	}

	.hero-card {
		align-self: center;
		background: #fff;
		border-radius: 14px;
		padding: 18px;
		border: 1px solid #f0f0f0;
		box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06);
		display: grid;
		gap: 10px;
	}

	.label {
		margin: 0;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #9a9a9a;
		font-weight: 700;
	}

	.hero-stats {
		display: grid;
		grid-template-columns: repeat(3, auto);
		align-items: center;
		gap: 14px;
	}

	.mini-stat {
		display: grid;
		gap: 4px;
		font-size: 14px;
		color: #4a4a4a;
	}

	.mini-stat strong {
		font-size: 22px;
		font-weight: 800;
		color: #e3473c;
	}

	.divider {
		width: 1px;
		height: 36px;
		background: #ededed;
	}

	.hint {
		margin: 0;
		font-size: 13px;
		color: #6f6f6f;
	}

	.section {
		position: relative;
		z-index: 1;
		background: #fff;
		border-radius: 16px;
		padding: 20px 22px;
		border: 1px solid #f1f1f1;
		box-shadow: 0 14px 42px rgba(0, 0, 0, 0.04);
		margin-bottom: 18px;
	}

	.section-head h2 {
		margin: 4px 0 6px 0;
		font-size: 22px;
		font-weight: 800;
		color: #2a2a2a;
	}

	.section-lede {
		margin: 0;
		color: #585858;
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
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-radius: 14px;
		background: linear-gradient(135deg, #fff, #fff8f6);
		border: 1px solid #f0dcd8;
		text-decoration: none;
		color: inherit;
		transition: transform 0.12s ease, box-shadow 0.2s ease;
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.04);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 14px 34px rgba(227, 71, 60, 0.18);
	}

	.stat-icon {
		font-size: 26px;
		background: #fff1f1;
		border-radius: 12px;
		padding: 10px;
		border: 1px solid #f4d5d2;
	}

	.stat-icon .ms-icon {
		font-size: 24px;
		color: #c23630;
	}

	.stat-body {
		display: grid;
		gap: 4px;
	}

	.stat-label {
		margin: 0;
		color: #4b4b4b;
		font-size: 14px;
		font-weight: 600;
	}

	.stat-value {
		margin: 0;
		font-size: 24px;
		font-weight: 800;
		color: #e3473c;
	}

	.chevron {
		font-size: 18px;
		color: #c23630;
		font-weight: 800;
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
		background: #fafafa;
		border: 1px solid #ededed;
		transition: transform 0.12s ease, box-shadow 0.18s ease, border-color 0.18s ease;
	}

	.feature-card:hover {
		transform: translateY(-1px);
		border-color: #f0d8d3;
		box-shadow: 0 10px 26px rgba(0, 0, 0, 0.05);
	}

	.feature-icon {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: #fff1f1;
		border: 1px solid #f4d5d2;
		display: grid;
		place-items: center;
		font-size: 20px;
	}

	.feature-icon .ms-icon {
		font-size: 22px;
		color: #c23630;
	}

	.feature-card h4 {
		margin: 0 0 6px 0;
		font-size: 16px;
		font-weight: 800;
		color: #2f2f2f;
	}

	.feature-card p {
		margin: 0;
		color: #5c5c5c;
		font-size: 14px;
		line-height: 1.45;
	}

	.loading {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		gap: 12px;
		padding: 60px;
		color: #4a4a4a;
		font-weight: 600;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 4px solid #ffe0db;
		border-top-color: #e3473c;
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

		.divider {
			display: none;
		}

		.stat-card {
			grid-template-columns: auto 1fr;
		}

		.chevron {
			display: none;
		}
	}
</style>
