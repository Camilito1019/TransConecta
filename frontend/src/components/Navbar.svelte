<script>
  import { auth, logout } from '../lib/stores.js';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function toggleSidebar() {
    dispatch('toggle');
  }

  function goToDashboard() {
    goto('/');
  }

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }
</script>

<nav class="navbar">
  <div class="navbar-container">
    <div class="logo-section">
      <button class="menu-btn" on:click={toggleSidebar}>
        ☰
      </button>
      <button class="logo-btn" on:click={goToDashboard}>
        <h1 class="logo">TransConecta</h1>
        <span class="arrow">→</span>
      </button>
    </div>

    {#if $auth.isAuthenticated}
      <div class="user-section">
        <span class="user-name">{$auth.usuario?.nombre_usuario || 'Usuario'}</span>
        <button class="logout-btn" on:click={handleLogout}>Cerrar Sesión</button>
      </div>
    {/if}
  </div>
</nav>

<style>
  .navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    max-width: 100%;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .menu-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    display: none;
  }

  .logo-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    padding: 0;
  }

  .logo-btn:hover {
    transform: translateX(5px);
  }

  .logo {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
  }

  .arrow {
    font-size: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .logo-btn:hover .arrow {
    opacity: 1;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .user-name {
    font-size: 14px;
  }

  .logout-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid white;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;
  }

  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    .menu-btn {
      display: block;
    }
  }
</style>
