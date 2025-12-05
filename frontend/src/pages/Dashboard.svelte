<script>
  import { onMount } from 'svelte';
  import { auth } from '../lib/stores.js';
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

<div class="dashboard">
  <h1>Bienvenido a TransConecta 🚀</h1>
  <p class="subtitle">Gestión Integral de Transporte y Logística</p>

  {#if loading}
    <p class="loading">Cargando estadísticas...</p>
  {:else}
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><span class="ms-icon">group</span></div>
        <div class="stat-content">
          <h3>Usuarios</h3>
          <p class="stat-number">{stats.usuarios}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><span class="ms-icon">local_shipping</span></div>
        <div class="stat-content">
          <h3>Vehículos</h3>
          <p class="stat-number">{stats.vehiculos}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><span class="ms-icon">badge</span></div>
        <div class="stat-content">
          <h3>Conductores</h3>
          <p class="stat-number">{stats.conductores}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><span class="ms-icon">map</span></div>
        <div class="stat-content">
          <h3>Trayectos</h3>
          <p class="stat-number">{stats.trayectos}</p>
        </div>
      </div>
    </div>
  {/if}

  <div class="features">
    <h2>Características Principales</h2>
    <div class="features-grid">
      <div class="feature-card">
        <h4><span class="ms-icon feature-icon-inline">person</span> Gestión de Usuarios</h4>
        <p>Crea, edita y administra usuarios con roles y permisos específicos.</p>
      </div>

      <div class="feature-card">
        <h4><span class="ms-icon feature-icon-inline">local_shipping</span> Gestión de Vehículos</h4>
        <p>Registra y controla la flota con documentos, historial y estado operativo.</p>
      </div>

      <div class="feature-card">
        <h4><span class="ms-icon feature-icon-inline">badge</span> Gestión de Conductores</h4>
        <p>Monitorea horas de conducción, alertas de fatiga y estado de conductores.</p>
      </div>

      <div class="feature-card">
        <h4><span class="ms-icon feature-icon-inline">map</span> Gestión de Trayectos</h4>
        <p>Crea rutas, asigna vehículos y conductores con seguimiento en tiempo real.</p>
      </div>

      <div class="feature-card">
        <h4><span class="ms-icon feature-icon-inline">route</span> Asignaciones</h4>
        <p>Coordina la asignación de trayectos a vehículos y conductores.</p>
      </div>

      <div class="feature-card">
        <h4><span class="ms-icon feature-icon-inline">insert_chart_outlined</span> Reportes</h4>
        <p>Visualiza estadísticas y métricas de operación del sistema.</p>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard {
    max-width: 1200px;
  }

  h1 {
    margin: 0 0 10px 0;
    font-size: 32px;
    color: #2c3e50;
  }

  .subtitle {
    margin: 0 0 40px 0;
    color: #666;
    font-size: 16px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 50px;
  }

  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: default;
    text-decoration: none;
    transition: all 0.3s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-icon {
    font-size: 32px;
    color: #c23630;
  }

  .stat-icon .ms-icon {
    font-size: 28px;
  }

  .stat-content h3 {
    margin: 0 0 5px 0;
    color: #2c3e50;
  }

  .stat-number {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #667eea;
  }

  .features {
    margin-top: 50px;
  }

  .features h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
    color: #2c3e50;
  }

  .feature-icon-inline {
    margin-right: 8px;
    font-size: 20px;
    color: #c23630;
    vertical-align: middle;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .feature-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .feature-card h4 {
    margin: 0 0 10px 0;
    color: #667eea;
  }

  .feature-card p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: #666;
  }
</style>
