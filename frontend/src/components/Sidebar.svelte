<script>
  import { goto } from '$app/navigation';
  import { logout, auth } from '../lib/stores.js';
  import { 
    tieneAccesoUsuarios, 
    tieneAccesoVehiculos, 
    tieneAccesoConductores, 
    tieneAccesoTrayectos, 
    tieneAccesoAsignaciones, 
    tieneAccesoRoles,
    tieneAccesoClientes,
    puedeRegistrarHoras,
    esHSEQ
  } from '../lib/permisos.js';

  export let open = false;

  function handleLogout() {
    logout();
    goto('/login');
  }

  // Reactivo: actualizar permisos cuando cambie el estado de auth
  $: usuario = $auth.usuario;
  $: mostrarDashboard = !esHSEQ();
  $: mostrarUsuarios = tieneAccesoUsuarios();
  $: mostrarRoles = tieneAccesoRoles();
  $: mostrarClientes = tieneAccesoClientes();
  $: mostrarVehiculos = tieneAccesoVehiculos();
  $: mostrarConductores = tieneAccesoConductores();
  $: mostrarTrayectos = tieneAccesoTrayectos();
  $: mostrarAsignaciones = tieneAccesoAsignaciones();
  $: mostrarRegistroHoras = puedeRegistrarHoras();
</script>

<aside class="sidebar" class:open class:collapsed={!open}>
  <nav class="nav-menu">
    {#if mostrarDashboard}
      <div class="nav-section">
        <h3>Dashboard</h3>
        <ul>
          <li>
            <a href="/">
              <span class="ms-icon nav-icon">home</span>
              <span>Inicio</span>
            </a>
          </li>
        </ul>
      </div>
    {/if}

    {#if mostrarUsuarios || mostrarRoles || mostrarClientes || mostrarVehiculos || mostrarConductores || mostrarTrayectos}
      <div class="nav-section">
        <h3>Gestión</h3>
        <ul>
          {#if mostrarUsuarios}
            <li><a href="/usuarios"><span class="ms-icon nav-icon">group</span><span>Usuarios</span></a></li>
          {/if}
          {#if mostrarClientes}
            <li><a href="/clientes"><span class="ms-icon nav-icon">diversity_3</span><span>Clientes</span></a></li>
          {/if}
          {#if mostrarRoles}
            <li><a href="/roles"><span class="ms-icon nav-icon">admin_panel_settings</span><span>Roles</span></a></li>
          {/if}
          {#if mostrarVehiculos}
            <li><a href="/vehiculos"><span class="ms-icon nav-icon">local_shipping</span><span>Vehículos</span></a></li>
          {/if}
          {#if mostrarConductores}
            <li><a href="/conductores"><span class="ms-icon nav-icon">badge</span><span>Conductores</span></a></li>
          {/if}
          {#if mostrarTrayectos}
            <li><a href="/trayectos"><span class="ms-icon nav-icon">map</span><span>Trayectos</span></a></li>
          {/if}
        </ul>
      </div>
    {/if}

    {#if mostrarAsignaciones || mostrarRegistroHoras}
      <div class="nav-section">
        <h3>Operaciones</h3>
        <ul>
          {#if mostrarAsignaciones}
            <li><a href="/asignaciones"><span class="ms-icon nav-icon">route</span><span>Asignaciones</span></a></li>
          {/if}
          {#if mostrarRegistroHoras}
            <li><a href="/operaciones/horas"><span class="ms-icon nav-icon">schedule</span><span>Registro de Horas</span></a></li>
          {/if}
        </ul>
      </div>
    {/if}

  </nav>
</aside>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&display=swap');

  .sidebar {
    width: 250px;
    background: #ffffff;
    color: #2a2a2a;
    overflow-y: auto;
    border-right: 1px solid #f0d8d3;
    box-shadow: 6px 0 20px rgba(0, 0, 0, 0.04);
    transition: transform 0.28s ease, box-shadow 0.2s ease, width 0.18s ease;
    font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
    transform: translateX(0);
  }

  .nav-menu {
    padding: 18px 0 16px 0;
  }

  .sidebar.collapsed {
    width: 0;
    min-width: 0;
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }

  .sidebar.collapsed .nav-menu {
    display: none;
  }

  .nav-section {
    margin-bottom: 18px;
  }

  .nav-section h3 {
    margin: 0 18px 8px 18px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a33b36;
    font-weight: 800;
  }

  .nav-section ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-section li {
    margin: 0;
  }

  .nav-section a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    color: #2f2f2f;
    text-decoration: none;
    border-left: 3px solid transparent;
    transition: background 0.16s ease, border-color 0.16s ease, transform 0.12s ease;
    border-radius: 10px;
    margin: 0 10px;
  }

  .nav-section a:hover {
    background: #fff5f4;
    border-color: #e3473c;
    transform: translateX(4px);
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    font-size: 20px;
    color: #c23630;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 64px;
      height: calc(100vh - 64px);
      transform: translateX(-100%);
      z-index: 100;
      box-shadow: 10px 0 26px rgba(0, 0, 0, 0.12);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .sidebar.collapsed {
      transform: translateX(-100%);
    }
  }

</style>
