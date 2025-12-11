<script>
  import { addNotificacion, auth } from '$lib/stores.js';
  import { usuarioService } from '$lib/api/services.js';
  import { goto } from '$app/navigation';

  let contrasena_actual = '';
  let contrasena_nueva = '';
  let confirmar = '';
  let showActual = false;
  let showNueva = false;
  let showConfirmar = false;
  let loading = false;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!contrasena_actual || !contrasena_nueva || !confirmar) {
      addNotificacion('Completa todos los campos', 'warning');
      return;
    }
    if (contrasena_nueva !== confirmar) {
      addNotificacion('Las contraseñas no coinciden', 'warning');
      return;
    }
    if (contrasena_nueva.length < 6) {
      addNotificacion('La nueva contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    loading = true;
    try {
      const maybeId = $auth?.usuario?.id_usuario;
      await usuarioService.cambiarContraseña(contrasena_actual, contrasena_nueva, maybeId);
      
      // Actualizar el store para quitar el flag de cambio obligatorio
      auth.update((state) => ({
        ...state,
        usuario: state.usuario ? { ...state.usuario, requiere_cambio_contrasena: false } : null
      }));
      
      addNotificacion('Contraseña actualizada exitosamente', 'success');
      contrasena_actual = '';
      contrasena_nueva = '';
      confirmar = '';
      
      // Esperar un poco antes de redirigir para que el usuario vea el mensaje
      setTimeout(() => {
        goto('/');
      }, 1500);
    } catch (err) {
      addNotificacion(err.message || 'Error al cambiar la contraseña', 'error');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Cambiar contraseña - TransConecta</title>
</svelte:head>

<div class="page-shell">
  <div class="shape shape-a" aria-hidden="true"></div>
  <div class="shape shape-b" aria-hidden="true"></div>

  <section class="card">
    <header class="card-head">
      <p class="eyebrow">Seguridad</p>
      <h1>Cambiar contraseña</h1>
      {#if $auth?.usuario?.requiere_cambio_contrasena}
        <p class="subtitle" style="color: #e3473c; font-weight: 600;">
          ⚠️ Debes cambiar tu contraseña temporal antes de continuar
        </p>
      {:else}
        <p class="subtitle">Actualiza tu clave con el mismo estilo del login.</p>
      {/if}
    </header>

    {#if $auth?.usuario?.requiere_cambio_contrasena}
      <div class="warning-box">
        <span class="ms-icon" style="font-size: 24px;">info</span>
        <div>
          <strong>Primera vez en el sistema</strong>
          <p>Por seguridad, debes cambiar tu contraseña temporal por una personalizada.</p>
        </div>
      </div>
    {/if}

    <form class="form" on:submit|preventDefault={handleSubmit}>
      <label class="field">
        <span>Contraseña actual</span>
        <div class="input-wrap">
          <input
            type={showActual ? 'text' : 'password'}
            bind:value={contrasena_actual}
            placeholder="••••••••"
            autocomplete="current-password"
            required
            disabled={loading}
          />
          <button type="button" class="eye" on:click={() => (showActual = !showActual)} aria-label="Mostrar u ocultar contraseña actual">
            <span class="ms-icon">{showActual ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
      </label>

      <label class="field">
        <span>Nueva contraseña</span>
        <div class="input-wrap">
          <input
            type={showNueva ? 'text' : 'password'}
            bind:value={contrasena_nueva}
            placeholder="••••••••"
            autocomplete="new-password"
            required
            disabled={loading}
          />
          <button type="button" class="eye" on:click={() => (showNueva = !showNueva)} aria-label="Mostrar u ocultar nueva contraseña">
            <span class="ms-icon">{showNueva ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
      </label>

      <label class="field">
        <span>Confirmar contraseña</span>
        <div class="input-wrap">
          <input
            type={showConfirmar ? 'text' : 'password'}
            bind:value={confirmar}
            placeholder="Repite la contraseña"
            autocomplete="new-password"
            required
            disabled={loading}
          />
          <button type="button" class="eye" on:click={() => (showConfirmar = !showConfirmar)} aria-label="Mostrar u ocultar confirmación">
            <span class="ms-icon">{showConfirmar ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
      </label>

      <button class="primary" type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

  .page-shell {
    position: relative;
    min-height: calc(100vh - 60px);
    display: grid;
    place-items: center;
    padding: 32px 16px;
    background: #f7f7f8;
    font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: #1f1f1f;
    overflow: hidden;
  }
  .shape { position: absolute; border-radius: 999px; filter: blur(70px); opacity: 0.4; }
  .shape-a { width: 360px; height: 360px; background: #f6c3c3; top: -120px; left: -80px; }
  .shape-b { width: 320px; height: 320px; background: #ffd8cf; bottom: -140px; right: -60px; }

  .card {
    position: relative;
    z-index: 1;
    width: min(540px, 100%);
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.08);
    padding: 26px 24px 24px;
    border: 1px solid #f0f0f0;
  }
  .card-head { display: grid; gap: 6px; margin-bottom: 18px; }
  .eyebrow { margin: 0; padding: 6px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #a33b36; background: #fff1f1; border-radius: 999px; width: fit-content; font-weight: 800; }
  h1 { margin: 4px 0 0 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: #2a2a2a; }
  .subtitle { margin: 0; font-size: 14px; color: #555; }

  .form { display: grid; gap: 14px; }
  .field { display: grid; gap: 6px; font-size: 14px; color: #3f3f46; }
  .field input {
    padding: 13px 12px;
    border-radius: 12px;
    border: 1.5px solid #e6e6e9;
    background: #fbfbfc;
    font-size: 15px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    font-family: inherit;
  }
  .field input:focus { outline: none; border-color: #e3473c; box-shadow: 0 10px 30px rgba(227,71,60,0.12); background: #fff; }

  .input-wrap { position: relative; display: flex; align-items: center; }
  .input-wrap input { width: 100%; padding-right: 44px; }
  .eye {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 18px;
    padding: 4px 6px;
    color: #c23630;
  }

  .warning-box {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .warning-box .ms-icon {
    color: #ffc107;
    flex-shrink: 0;
  }

  .warning-box strong {
    display: block;
    margin-bottom: 4px;
    color: #856404;
  }

  .warning-box p {
    margin: 0;
    color: #856404;
    font-size: 14px;
  }

  .primary {
    margin-top: 6px;
    border: 1px solid #f4d5d2;
    border-radius: 12px;
    padding: 12px 14px;
    font-weight: 800;
    cursor: pointer;
    background: linear-gradient(135deg, #e3473c, #c23630);
    color: #fff;
    box-shadow: 0 12px 26px rgba(227,71,60,0.25);
    transition: transform 0.12s ease, box-shadow 0.18s ease;
  }
  .primary:hover { transform: translateY(-1px); }
  .primary:disabled { opacity: 0.7; cursor: not-allowed; }

  @media (max-width: 540px) {
    .card { padding: 22px 18px; }
    h1 { font-size: 24px; }
  }
</style>
