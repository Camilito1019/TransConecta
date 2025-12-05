<script>
  import { notificaciones } from '../lib/stores.js';
</script>

<div class="notificaciones-container">
  {#each $notificaciones as notificacion (notificacion.id)}
    <div class="notificacion notificacion-{notificacion.tipo}">
      <span>{notificacion.mensaje}</span>
    </div>
  {/each}
</div>

<style>
  .notificaciones-container {
    position: fixed;
    top: 70px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notificacion {
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
    max-width: 300px;
  }

  .notificacion-info {
    background-color: #3498db;
    color: white;
  }

  .notificacion-success {
    background-color: #2ecc71;
    color: white;
  }

  .notificacion-warning {
    background-color: #f39c12;
    color: white;
  }

  .notificacion-error {
    background-color: #e74c3c;
    color: white;
  }

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
