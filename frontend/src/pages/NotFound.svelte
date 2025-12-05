<script>
  import { auth } from '../lib/stores.js';
</script>

<div class="not-found">
  <div class="content">
    <h1>404</h1>
    <p>Página no encontrada</p>
    {#if $auth.isAuthenticated}
      <a href="/" class="btn">Volver al Inicio</a>
    {:else}
      <a href="/login" class="btn">Ir a Login</a>
    {/if}
  </div>
</div>

<style>
  .not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .content {
    text-align: center;
    color: white;
  }

  h1 {
    font-size: 120px;
    margin: 0;
  }

  p {
    font-size: 24px;
    margin: 20px 0;
  }

  .btn {
    display: inline-block;
    padding: 12px 24px;
    background-color: white;
    color: #667eea;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    margin-top: 20px;
  }
</style>
