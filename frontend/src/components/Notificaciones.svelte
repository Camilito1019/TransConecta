<script>
  import { notificaciones } from '../lib/stores.js';
</script>

<div class="notificaciones-container">
  {#each $notificaciones as notificacion (notificacion.id)}
    <div class={`notificacion notificacion-${notificacion.tipo}`}>
      <div class="dot"></div>
      <span>{notificacion.mensaje}</span>
    </div>
  {/each}
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&display=swap');

  .notificaciones-container {
    position: fixed;
    top: 82px;
    right: 18px;
    z-index: 1200;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }

  .notificacion {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid var(--tc-border-strong);
    background: var(--tc-surface);
    box-shadow: var(--tc-shadow);
    animation: slideIn 0.24s ease;
    min-width: 240px;
    max-width: 360px;
    color: var(--tc-text);
    font-weight: 700;
  }

  .notificacion .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--tc-text), transparent 92%);
  }

  :global(html[data-theme='dark']) .notificacion-info {
    border-color: #2c3f63;
    background: #161f2d;
    color: #dbe7ff;
  }

  :global(html[data-theme='dark']) .notificacion-success {
    border-color: #214231;
    background: #141f18;
    color: #d9ffe9;
  }

  :global(html[data-theme='dark']) .notificacion-warning {
    border-color: #4b3b1f;
    background: #1f1a12;
    color: #ffe8c7;
  }

  :global(html[data-theme='dark']) .notificacion-error {
    border-color: color-mix(in srgb, var(--tc-accent), #000 45%);
    background: color-mix(in srgb, var(--tc-accent), #000 78%);
    color: var(--tc-text);
  }

  .notificacion-info {
    border-color: #c8d9ff;
    background: #f4f7ff;
    color: #1f3b6f;
  }

  .notificacion-info .dot {
    background: #3b82f6;
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.12);
  }

  .notificacion-success {
    border-color: #cce8d8;
    background: #f2fcf6;
    color: #1d5a39;
  }

  .notificacion-success .dot {
    background: #16a34a;
    box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.14);
  }

  .notificacion-warning {
    border-color: #f8e3c2;
    background: #fff8ee;
    color: #7a4a12;
  }

  .notificacion-warning .dot {
    background: #f59e0b;
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.16);
  }

  .notificacion-error {
    border-color: #f4d5d2;
    background: #fff1f1;
    color: #a33b36;
  }

  .notificacion-error .dot {
    background: #e3473c;
    box-shadow: 0 0 0 6px rgba(227, 71, 60, 0.16);
  }

  @keyframes slideIn {
    from {
      transform: translateX(120px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
