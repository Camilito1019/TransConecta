<script>
  export let open = false;
</script>

<aside class="sidebar" class:open>
  <nav class="nav-menu">
    <div class="nav-section">
      <h3>Dashboard</h3>
      <ul>
        <li><a href="/">🏠 Inicio</a></li>
      </ul>
    </div>

    <div class="nav-section">
      <h3>Gestión</h3>
      <ul>
        <li><a href="/usuarios">👥 Usuarios</a></li>
        <li><a href="/roles">🔐 Roles</a></li>
        <li><a href="/vehiculos">🚗 Vehículos</a></li>
        <li><a href="/conductores">🚦 Conductores</a></li>
        <li><a href="/trayectos">🗺️ Trayectos</a></li>
      </ul>
    </div>

    <div class="nav-section">
      <h3>Operaciones</h3>
      <ul>
        <li><a href="/asignaciones">📍 Asignaciones</a></li>
        <li><a href="/reportes">📊 Reportes</a></li>
      </ul>
    </div>

    <div class="nav-section">
      <h3>Configuración</h3>
      <ul>
        <li><a href="/perfil">⚙️ Mi Perfil</a></li>
        <li><a href="/cambiar-contrasena">🔑 Cambiar Contraseña</a></li>
      </ul>
    </div>
  </nav>
</aside>

<style>
  .sidebar {
    width: 250px;
    background-color: #2c3e50;
    color: white;
    overflow-y: auto;
    transition: transform 0.3s ease;
  }

  .nav-menu {
    padding: 20px 0;
  }

  .nav-section {
    margin-bottom: 30px;
  }

  .nav-section h3 {
    margin: 0 20px 10px 20px;
    font-size: 12px;
    text-transform: uppercase;
    color: #95a5a6;
    font-weight: bold;
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
    display: block;
    padding: 12px 20px;
    color: white;
    text-decoration: none;
    transition: background 0.3s;
  }

  .nav-section a:hover {
    background-color: #34495e;
    border-left: 3px solid #667eea;
    padding-left: 17px;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 60px;
      height: calc(100vh - 60px);
      transform: translateX(-100%);
      z-index: 100;
    }

    .sidebar.open {
      transform: translateX(0);
    }
  }
</style>
