<script>
  import { auth, logout } from '../lib/stores.js';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import { puedeAccion } from '../lib/permisos.js';
  import { onMount } from 'svelte';
  import { initTheme, toggleTheme, theme as themeStore } from '../lib/theme.js';

  const dispatch = createEventDispatcher();

  let userMenuOpen = false;
  let currentTheme = 'light';

  onMount(() => {
    currentTheme = initTheme();
    const unsub = themeStore.subscribe((t) => {
      currentTheme = t;
    });
    return () => unsub();
  });

  function toggleSidebar() {
    dispatch('toggle');
  }

  function goToDashboard() {
    if (puedeAccion('dashboard', 'ver')) {
      goto('/');
      return;
    }
    if (puedeAccion('registroHoras', 'ver')) {
      goto('/operaciones/horas');
    }
  }

  function handleLogout() {
    logout();
    // Usar replace para evitar que el usuario vuelva atrás
    window.location.replace('/login');
  }

  function toggleUserMenu(event) {
    event.stopPropagation();
    userMenuOpen = !userMenuOpen;
  }

  function goPerfil() {
    userMenuOpen = false;
    goto('/perfil');
  }

  function goCambioContrasena() {
    userMenuOpen = false;
    goto('/cambiar-contrasena');
  }

  function goModulos() {
    userMenuOpen = false;
    goto('/modulos');
  }

  function cerrarSesion() {
    userMenuOpen = false;
    handleLogout();
  }

  function toggleTema() {
    toggleTheme();
  }
</script>

<nav class="navbar">
  <div class="navbar-container">
    <div class="left">
      <button class="icon-btn" on:click={toggleSidebar} aria-label="Abrir menú">
        <span class="ms-icon">menu</span>
      </button>

      {#if !puedeAccion('dashboard', 'ver')}
        <div class="brand brand-disabled">
          <div class="brand-mark">TC</div>
          <div class="brand-text">
            <span class="brand-eyebrow">Panel</span>
            <span class="brand-name">TransConecta</span>
          </div>
        </div>
      {:else}
        <button class="brand" on:click={goToDashboard}>
          <div class="brand-mark">TC</div>
          <div class="brand-text">
            <span class="brand-eyebrow">Panel</span>
            <span class="brand-name">TransConecta</span>
          </div>
        </button>
      {/if}
    </div>

    {#if $auth.isAuthenticated}
      <div class="right">
        <button
          class="icon-btn"
          on:click={toggleTema}
          aria-label={currentTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={currentTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <span class="ms-icon">{currentTheme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>

        <button class="user-pill" on:click={toggleUserMenu} aria-haspopup="true" aria-expanded={userMenuOpen}>
          <span class="dot"></span>
          <div class="user-meta">
            <span class="user-name">{$auth.usuario?.nombre_usuario || 'Usuario'}</span>
            <span class="user-role">{$auth.nombre_rol || $auth.usuario?.nombre_rol || 'Rol'}</span>
          </div>
          <span class="ms-icon caret">{userMenuOpen ? 'expand_less' : 'expand_more'}</span>
        </button>

        {#if userMenuOpen}
          <div class="user-menu" role="menu" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
            <button class="menu-item" on:click={goPerfil}>
              <span class="ms-icon">account_circle</span>
              <span>Mi Perfil</span>
            </button>
            <button class="menu-item" on:click={goCambioContrasena}>
              <span class="ms-icon">vpn_key</span>
              <span>Cambiar contraseña</span>
            </button>
            {#if puedeAccion('modulos', 'ver')}
              <button class="menu-item" on:click={goModulos}>
                <span class="ms-icon">view_quilt</span>
                <span>Módulos</span>
              </button>
            {/if}
            <button class="menu-item danger" on:click={cerrarSesion}>
              <span class="ms-icon">logout</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</nav>

<svelte:window on:click={() => (userMenuOpen = false)} />

<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap');

  .navbar {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--tc-surface), transparent 20%);
    border-bottom: 1px solid var(--tc-border);
    box-shadow: var(--tc-shadow);
    width: 100%;
  }

  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    gap: 12px;
  }

  .user-pill:hover { transform: translateY(-1px); box-shadow: 0 10px 24px color-mix(in srgb, var(--tc-accent), transparent 88%); }
  .user-pill:focus-visible { outline: 2px solid var(--tc-accent); outline-offset: 2px; }

  .caret { font-size: 18px; color: var(--tc-accent-2); }

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    border: 1px solid var(--tc-border-strong);
    background: var(--tc-surface-2);
    color: var(--tc-accent-2);
    font-size: 18px;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.2s ease;
  }

  .icon-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px color-mix(in srgb, #000, transparent 78%);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .brand-mark {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--tc-accent), var(--tc-accent-2));
    color: var(--tc-on-accent);
    display: grid;
    place-items: center;
    font-weight: 800;
    letter-spacing: -0.03em;
    border: 1px solid var(--tc-border-strong);
    box-shadow: 0 10px 24px color-mix(in srgb, var(--tc-accent), transparent 70%);
  }

  .brand-text {
    display: grid;
    gap: 2px;
  }

  .brand-eyebrow {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: color-mix(in srgb, var(--tc-accent-2), var(--tc-text) 35%);
    font-weight: 800;
  }

  .brand-name {
    font-size: 17px;
    font-weight: 800;
    color: var(--tc-text);
    letter-spacing: -0.01em;
  }

  .brand-disabled {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    text-align: left;
    cursor: default;
    opacity: 0.8;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    position: relative;
  }

  .user-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 999px;
    background: var(--tc-surface-3);
    border: 1px solid var(--tc-border-strong);
    color: color-mix(in srgb, var(--tc-accent-2), var(--tc-text) 35%);
    box-shadow: 0 8px 20px color-mix(in srgb, var(--tc-accent), transparent 88%);
  }

  .user-meta { display: grid; line-height: 1.2; }
  .user-name { font-size: 13px; font-weight: 800; }
  .user-role { font-size: 11px; font-weight: 700; color: color-mix(in srgb, var(--tc-text-muted), var(--tc-accent-2) 10%); text-transform: uppercase; letter-spacing: 0.08em; }

  .user-pill .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2ecc71;
    box-shadow: 0 0 0 6px rgba(46, 204, 113, 0.18);
  }

  /* logout button removed; styles intentionally deleted */

  .user-menu {
    position: absolute;
    top: 52px;
    right: 0;
    background: var(--tc-surface);
    border: 1px solid var(--tc-border);
    border-radius: 12px;
    box-shadow: var(--tc-shadow-strong);
    padding: 8px;
    display: grid;
    gap: 4px;
    min-width: 200px;
    z-index: 20;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: none;
    background: transparent;
    border-radius: 10px;
    font-weight: 700;
    color: var(--tc-text);
    cursor: pointer;
    transition: background 0.12s ease, transform 0.12s ease;
    width: 100%;
    text-align: left;
  }

  .menu-item:hover { background: var(--tc-surface-2); transform: translateX(2px); }
  .menu-item .ms-icon { color: var(--tc-accent-2); font-size: 18px; }
  .menu-item.danger { color: color-mix(in srgb, var(--tc-accent-2), var(--tc-text) 25%); }


  @media (max-width: 768px) {
    .navbar-container {
      padding: 12px 14px;
    }

    .icon-btn {
      display: inline-flex;
    }

    .brand-name {
      font-size: 16px;
    }

    .right {
      gap: 8px;
    }

    .user-pill {
      display: none;
    }
  }
</style>
