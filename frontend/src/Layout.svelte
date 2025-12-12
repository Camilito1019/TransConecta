<script>
  import Navbar from './components/Navbar.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Notificaciones from './components/Notificaciones.svelte';
  import { auth } from './lib/stores.js';
  
  let sidebarOpen = false;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<div class="layout">
  <Navbar on:toggle={toggleSidebar} />
  
  <div class="main-container">
    {#if $auth.isAuthenticated}
      <Sidebar open={sidebarOpen} />
      <main class="content">
        <slot />
      </main>
    {:else}
      <main class="content full-width">
        <slot />
      </main>
    {/if}
  </div>

  <Notificaciones />
</div>

<style>
  .layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--tc-bg);
  }

  .main-container {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: var(--tc-bg);
  }

  .content.full-width {
    width: 100%;
  }
</style>
