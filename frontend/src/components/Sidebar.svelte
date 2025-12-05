<script>
  import { goto } from '$app/navigation';
  import { logout } from '../lib/stores.js';

  export let open = false;

  function handleLogout() {
    logout();
    goto('/login');
  }
</script>

<aside class="sidebar" class:open class:collapsed={!open}>
  <nav class="nav-menu">
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

    <div class="nav-section">
      <h3>Gestión</h3>
      <ul>
        <li><a href="/usuarios"><span class="ms-icon nav-icon">group</span><span>Usuarios</span></a></li>
        <li><a href="/roles"><span class="ms-icon nav-icon">admin_panel_settings</span><span>Roles</span></a></li>
        <li><a href="/vehiculos"><span class="ms-icon nav-icon">local_shipping</span><span>Vehículos</span></a></li>
        <li><a href="/conductores"><span class="ms-icon nav-icon">badge</span><span>Conductores</span></a></li>
        <li><a href="/trayectos"><span class="ms-icon nav-icon">map</span><span>Trayectos</span></a></li>
      </ul>
    </div>

    <div class="nav-section">
      <h3>Operaciones</h3>
      <ul>
        <li><a href="/asignaciones"><span class="ms-icon nav-icon">route</span><span>Asignaciones</span></a></li>
        <li><a href="/reportes"><span class="ms-icon nav-icon">insert_chart_outlined</span><span>Reportes</span></a></li>
        <li><a href="/operaciones/horas"><span class="ms-icon nav-icon">schedule</span><span>Registro de Horas</span></a></li>
      </ul>
    </div>

    <div class="nav-section">
      <h3>Configuración</h3>
      <ul>
        <li><a href="/perfil"><span class="ms-icon nav-icon">account_circle</span><span>Mi Perfil</span></a></li>
        <li><a href="/cambiar-contrasena"><span class="ms-icon nav-icon">vpn_key</span><span>Cambiar Contraseña</span></a></li>
      </ul>
    </div>

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
