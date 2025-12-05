<script>
  import { onMount } from 'svelte';
  import { authService } from '$lib/api/services.js';
  import { addNotificacion, auth, setAuthUsuario } from '$lib/stores.js';

  let loading = true;
  let saving = false;
  let form = { nombre_usuario: '', correo: '' };

  const avatarInitials = (nombre) => {
    if (!nombre) return 'TC';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  onMount(() => {
    void cargarPerfil();
  });

  async function cargarPerfil() {
    loading = true;
    try {
      const res = await authService.me();
      if (res?.usuario) {
        setAuthUsuario(res.usuario);
        form = {
          nombre_usuario: res.usuario.nombre_usuario || '',
          correo: res.usuario.correo || '',
        };
      }
    } catch (err) {
      addNotificacion(err.message || 'No se pudo cargar el perfil', 'error');
    } finally {
      loading = false;
    }
  }

  async function guardarPerfil() {
    if (!form.nombre_usuario || !form.correo) {
      addNotificacion('Nombre y correo son obligatorios', 'warning');
      return;
    }

    saving = true;
    try {
      const payload = {
        nombre_usuario: form.nombre_usuario,
        correo: form.correo,
      };

      const res = await authService.actualizarPerfil(payload);
      if (res?.usuario) {
        setAuthUsuario(res.usuario);
      }
      addNotificacion(res?.mensaje || 'Perfil actualizado', 'success');
    } catch (err) {
      addNotificacion(err.message || 'No se pudo actualizar el perfil', 'error');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Mi Perfil - TransConecta</title>
</svelte:head>

<div class="profile-shell">
  <div class="bg shape-a" aria-hidden="true"></div>
  <div class="bg shape-b" aria-hidden="true"></div>

  <section class="profile-card">
    <header class="profile-head">
      <div class="avatar">{avatarInitials($auth.usuario?.nombre_usuario)}</div>
      <div class="head-text">
        <p class="eyebrow">Cuenta</p>
        <h1>Mi Perfil</h1>
        <p class="lede">Revisa y actualiza tus datos personales.</p>
        <div class="chips">
          <span class="chip">{$auth.usuario?.correo || 'correo@dominio.com'}</span>
          <span class="chip soft">{$auth.nombre_rol || $auth.usuario?.nombre_rol || 'Rol'}</span>
          <span class="chip state">{($auth.usuario?.estado || 'activo').toUpperCase()}</span>
        </div>
      </div>
    </header>

    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando tu perfil...</p>
      </div>
    {:else}
      <div class="form-grid">
        <label class="field">
          <span>Nombre</span>
          <input
            type="text"
            bind:value={form.nombre_usuario}
            placeholder="Tu nombre"
            autocomplete="name"
          />
        </label>

        <label class="field">
          <span>Correo</span>
          <input
            type="email"
            bind:value={form.correo}
            placeholder="correo@ejemplo.com"
            autocomplete="email"
          />
        </label>

      </div>

      <div class="actions">
        <button type="button" class="primary" on:click={guardarPerfil} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    {/if}
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

  .profile-shell {
    position: relative;
    min-height: calc(100vh - 60px);
    padding: 24px 16px 36px;
    display: grid;
    place-items: center;
    background: #f7f7f8;
    overflow: hidden;
    font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: #1f1f1f;
  }

  .bg { position: absolute; border-radius: 999px; filter: blur(70px); opacity: 0.4; }
  .shape-a { width: 360px; height: 360px; background: #f6c3c3; top: -120px; left: -80px; }
  .shape-b { width: 320px; height: 320px; background: #ffd8cf; bottom: -140px; right: -60px; }

  .profile-card {
    position: relative;
    z-index: 1;
    width: min(900px, 100%);
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.08);
    padding: 26px 24px 22px;
    border: 1px solid #f0f0f0;
  }

  .profile-head { display: flex; gap: 14px; align-items: center; margin-bottom: 18px; }
  .avatar {
    width: 70px; height: 70px; border-radius: 18px;
    background: linear-gradient(135deg, #e3473c, #c23630);
    color: #fff; display: grid; place-items: center;
    font-size: 22px; font-weight: 800;
    box-shadow: 0 14px 34px rgba(227, 71, 60, 0.28);
    border: 1px solid #f4d5d2;
  }
  .head-text h1 { margin: 4px 0 4px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .eyebrow { margin: 0 0 2px 0; padding: 6px 10px; background: #fff1f1; color: #a33b36; border-radius: 999px; font-size: 11px; letter-spacing: 0.1em; font-weight: 800; display: inline-block; }
  .lede { margin: 0; color: #4f4f4f; font-size: 14px; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .chip { padding: 8px 12px; border-radius: 12px; background: #fff7f6; border: 1px solid #f4d5d2; font-weight: 700; color: #a33b36; font-size: 12px; }
  .chip.soft { background: #fafafa; color: #3f3f46; border-color: #ededed; }
  .chip.state { background: #f2fcf6; color: #1d5a39; border-color: #cce8d8; }

  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 12px; }
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
  .field input:focus { outline: none; border-color: #e3473c; box-shadow: 0 10px 28px rgba(227,71,60,0.12); background: #fff; }

  .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
  .primary {
    border-radius: 12px;
    padding: 12px 14px;
    font-weight: 800;
    cursor: pointer;
    border: 1px solid #f4d5d2;
    background: linear-gradient(135deg, #e3473c, #c23630);
    color: #fff;
    box-shadow: 0 12px 26px rgba(227,71,60,0.25);
    transition: transform 0.12s ease, box-shadow 0.18s ease;
  }
  .primary:hover { transform: translateY(-1px); }
  .primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .loading { display: grid; place-items: center; gap: 10px; padding: 40px 0; color: #4a4a4a; }
  .spinner { width: 32px; height: 32px; border-radius: 50%; border: 4px solid #ffe0db; border-top-color: #e3473c; animation: spin 0.8s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }

  @media (max-width: 640px) {
    .profile-card { padding: 20px 16px; }
    .profile-head { flex-direction: column; align-items: flex-start; }
    .avatar { width: 62px; height: 62px; }
  }
</style>
