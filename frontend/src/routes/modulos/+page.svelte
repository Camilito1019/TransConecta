<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { addNotificacion } from '$lib/stores.js';
  import { puedeAccion, getRolActual } from '$lib/permisos.js';
  import {
    modulosConfig,
    modulosCargando,
    MODULOS,
    ACCIONES,
    cargarConfigModulos,
    cargarConfigRol,
    guardarConfigRol,
    resetConfigBackend,
    getDefaultConfig,
    getConfigForRol
  } from '$lib/modulos.js';

  const etiquetas = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    clientes: 'Clientes',
    roles: 'Roles',
    modulos: 'Permisos',
    vehiculos: 'Vehículos',
    conductores: 'Conductores',
    trayectos: 'Trayectos',
    asignaciones: 'Asignaciones',
    registroHoras: 'Registro de Horas'
  };

  const rolPorDefecto = getRolActual() || 'ADMINISTRADOR';
  let rolActivo = rolPorDefecto;
  let configLocal = {};
  let cargandoInicial = true;
  let cargandoRol = false;
  let guardando = false;
  let reseteando = false;
  let dirty = false;

  $: config = $modulosConfig;
  $: rolesDisponibles = Object.keys(config || {});

  onMount(async () => {
    if (!puedeAccion('modulos', 'ver')) {
      addNotificacion('No tienes permisos para gestionar permisos de módulos', 'error');
      goto('/');
      return;
    }

    try {
      await cargarConfigModulos();
      sincronizarDesdeStore(rolActivo);
    } catch (error) {
      console.warn('No se pudo cargar configuración de módulos', error);
      addNotificacion('No se pudo cargar la configuración; usando valores por defecto', 'warning');
      configLocal = clonar(getDefaultConfig()[rolActivo] || {});
    } finally {
      cargandoInicial = false;
    }
  });

  function clonar(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
  }

  function sincronizarDesdeStore(rol) {
    const base = getConfigForRol(rol) || getDefaultConfig()[rol] || {};
    configLocal = clonar(base);
    // Asegurar que todos los módulos existan
    MODULOS.forEach(m => {
      if (!configLocal[m]) {
        configLocal[m] = {
          sidebar: false,
          acciones: Object.fromEntries(ACCIONES.map((a) => [a, false]))
        };
      }
    });
    console.log('✅ Configuración sincronizada para', rol, ':', configLocal);
    dirty = false;
  }

  async function cambiarRol(event) {
    const nuevoRol = event.target.value;

    if (dirty && !confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
      event.target.value = rolActivo;
      return;
    }

    rolActivo = nuevoRol;
    dirty = false;

    // Traer la configuración fresca desde backend para ese rol
    cargandoRol = true;
    try {
      await cargarConfigRol(nuevoRol);
      sincronizarDesdeStore(nuevoRol);
      addNotificacion(`Permisos cargados para ${nuevoRol}`, 'info');
    } catch (error) {
      console.error('No se pudo cargar permisos del rol seleccionado', error);
      addNotificacion('No se pudo cargar los permisos del rol seleccionado', 'error');
      configLocal = clonar(getDefaultConfig()[nuevoRol] || {});
    } finally {
      cargandoRol = false;
    }
  }

  function asegurarModulo(modulo) {
    if (!configLocal[modulo]) {
      configLocal[modulo] = {
        sidebar: false,
        acciones: Object.fromEntries(ACCIONES.map((a) => [a, false]))
      };
    }
    if (!configLocal[modulo].acciones) {
      configLocal[modulo].acciones = Object.fromEntries(ACCIONES.map((a) => [a, false]));
    }
  }

  function toggleSidebar(modulo) {
    asegurarModulo(modulo);
    const estadoActual = configLocal[modulo]?.sidebar || false;
    const nuevoEstado = !estadoActual;
    
    // Crear nueva referencia para forzar reactividad
    configLocal = {
      ...configLocal,
      [modulo]: {
        ...configLocal[modulo],
        sidebar: nuevoEstado
      }
    };

    dirty = true;
    console.log(`🔄 Toggle sidebar ${modulo}: ${estadoActual} -> ${nuevoEstado}`);
  }

  function toggleAccion(modulo, accion) {
    asegurarModulo(modulo);
    const estadoActual = configLocal[modulo]?.acciones?.[accion] || false;
    const nuevoEstado = !estadoActual;
    
    // Crear nueva referencia para forzar reactividad
    configLocal = {
      ...configLocal,
      [modulo]: {
        ...configLocal[modulo],
        acciones: {
          ...configLocal[modulo].acciones,
          [accion]: nuevoEstado
        }
      }
    };

    dirty = true;
    console.log(`🔄 Toggle acción ${modulo}.${accion}: ${estadoActual} -> ${nuevoEstado}`);
  }

  async function guardarCambios() {
    if (!dirty) {
      addNotificacion('No hay cambios para guardar', 'info');
      return;
    }

    if (!puedeAccion('modulos', 'editar')) {
      addNotificacion('No tienes permisos para editar permisos de módulos', 'error');
      return;
    }

    guardando = true;
    try {
      console.log('Guardando configuración para rol:', rolActivo, configLocal);
      await guardarConfigRol(rolActivo, clonar(configLocal));
      // Releer desde backend para asegurar que la vista refleje lo guardado
      await cargarConfigRol(rolActivo);
      sincronizarDesdeStore(rolActivo);
      addNotificacion(`Permisos actualizados para ${rolActivo}`, 'success');
      dirty = false;
    } catch (error) {
      console.error('Error guardando permisos', error);
      addNotificacion(error.message || 'No se pudo guardar la configuración', 'error');
    } finally {
      guardando = false;
    }
  }

  async function resetRol() {
    if (!confirm(`¿Estás seguro de restablecer los permisos del rol ${rolActivo} a sus valores por defecto?`)) {
      return;
    }
    
    if (!puedeAccion('modulos', 'editar')) {
      addNotificacion('No tienes permisos para restablecer permisos', 'error');
      return;
    }

    guardando = true;
    try {
      const defaults = clonar(getDefaultConfig()[rolActivo]);
      await guardarConfigRol(rolActivo, defaults);
      await cargarConfigRol(rolActivo);
      sincronizarDesdeStore(rolActivo);
      addNotificacion(`Permisos restablecidos para ${rolActivo}`, 'success');
      dirty = false;
    } catch (error) {
      console.error('Error restableciendo rol', error);
      addNotificacion(error.message || 'No se pudo restablecer el rol', 'error');
    } finally {
      guardando = false;
    }
  }

  async function resetTodo() {
    if (!confirm('¿Estás seguro de restablecer TODOS los roles a sus valores por defecto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    if (!puedeAccion('modulos', 'eliminar')) {
      addNotificacion('No tienes permisos para restablecer toda la configuración', 'error');
      return;
    }

    reseteando = true;
    try {
      const normalizada = await resetConfigBackend();
      configLocal = clonar(normalizada?.[rolActivo] || getDefaultConfig()[rolActivo]);
      addNotificacion('Permisos restablecidos para todos los roles', 'success');
      dirty = false;
    } catch (error) {
      console.error('Error restableciendo configuración', error);
      addNotificacion(error.message || 'No se pudo restablecer la configuración completa', 'error');
    } finally {
      reseteando = false;
    }
  }

  function estadoAccion(modulo, accion) {
    const estado = Boolean(configLocal?.[modulo]?.acciones?.[accion]);
    return estado;
  }

  function estadoSidebar(modulo) {
    const estado = Boolean(configLocal?.[modulo]?.sidebar);
    return estado;
  }

  // Logs reactivos para debug
  $: if (configLocal && Object.keys(configLocal).length > 0) {
    console.log('📊 ConfigLocal actualizado:', JSON.parse(JSON.stringify(configLocal)));
    console.log('📈 Módulos cargados:', Object.keys(configLocal).length);
  }

  $: if (dirty) {
    console.log('💾 Hay cambios sin guardar');
  }
</script>

<svelte:head>
  <title>Configurar Módulos - TransConecta</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
</svelte:head>

<div class="page-shell">
  <div class="bg-shape shape-a" aria-hidden="true"></div>
  <div class="bg-shape shape-b" aria-hidden="true"></div>

  <section class="hero">
    <div class="hero-text">
      <p class="eyebrow">Permisos</p>
      <h1>Configurar visibilidad y acciones</h1>
      <p class="lede">Activa qué módulos aparecen en el sidebar y qué acciones (ver, editar, eliminar, desactivar) están disponibles por rol.</p>
      {#if dirty}
        <p class="cambios-pendientes">⚠️ Tienes cambios sin guardar</p>
      {/if}
    </div>
    <div class="hero-actions">
      <button class="ghost" on:click={resetRol} disabled={guardando || $modulosCargando}>Restablecer rol</button>
      <button class="outline" on:click={resetTodo} disabled={reseteando || $modulosCargando}>Restablecer todo</button>
      <button class="primary" on:click={guardarCambios} disabled={guardando || $modulosCargando || !dirty}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  </section>

  <section class="panel">
    <div class="panel-head">
      <div>
        <p class="label">Rol objetivo</p>
        <h2>Permisos para rol</h2>
      </div>
      <select class="select" bind:value={rolActivo} on:change={cambiarRol} disabled={$modulosCargando || cargandoInicial}>
        {#each rolesDisponibles as rol}
          <option value={rol}>{rol}</option>
        {/each}
      </select>
    </div>

    {#if cargandoInicial || $modulosCargando || cargandoRol}
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando configuración de módulos...</p>
      </div>
    {:else}
      <div class="grid">
        {#each MODULOS as modulo (modulo)}
          <div class="card">
            <div class="card-head">
              <div>
                <p class="label">{etiquetas[modulo] || modulo}</p>
                <h3>{Boolean(configLocal?.[modulo]?.sidebar) ? 'Visible en menú' : 'Oculto en menú'}</h3>
              </div>
              <button
                type="button"
                class={`toggle ${Boolean(configLocal?.[modulo]?.sidebar) ? 'on' : ''}`}
                aria-pressed={Boolean(configLocal?.[modulo]?.sidebar)}
                on:click={() => toggleSidebar(modulo)}
                disabled={guardando || reseteando || cargandoRol}
              >
                <span>{Boolean(configLocal?.[modulo]?.sidebar) ? 'On' : 'Off'}</span>
                <span class="thumb"></span>
              </button>
            </div>

            <div class="acciones">
              {#each ACCIONES as accion (accion)}
                <button
                  type="button"
                  class={`chip ${Boolean(configLocal?.[modulo]?.acciones?.[accion]) ? 'chip-on' : 'chip-off'}`}
                  aria-pressed={Boolean(configLocal?.[modulo]?.acciones?.[accion])}
                  on:click={() => toggleAccion(modulo, accion)}
                  disabled={guardando || reseteando || cargandoRol}
                >
                  <span class="ms-icon">{Boolean(configLocal?.[modulo]?.acciones?.[accion]) ? 'check_circle' : 'block'}</span>
                  <span>{accion}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap');

  .page-shell { position: relative; padding: 22px 20px 60px 20px; font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1f1f1f; }
  .bg-shape { position: absolute; border-radius: 999px; filter: blur(90px); opacity: 0.32; z-index: 0; }
  .shape-a { width: 420px; height: 420px; background: #f6c3c3; top: -140px; left: -120px; }
  .shape-b { width: 360px; height: 360px; background: #ffd8cf; bottom: -160px; right: -120px; }

  .hero { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 16px; align-items: center; background: linear-gradient(125deg, #ffffff 0%, #fff4f2 100%); border: 1px solid #f0d8d3; border-radius: 16px; padding: 18px 20px; box-shadow: 0 12px 36px rgba(0,0,0,0.06); margin-bottom: 16px; }
  .hero-text h1 { margin: 6px 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: #a33b36; font-weight: 800; margin: 0; }
  .lede { margin: 0; color: #4f4f4f; font-size: 14px; max-width: 520px; }
  .cambios-pendientes { 
    margin: 8px 0 0 0; 
    color: #e3473c; 
    font-size: 13px; 
    font-weight: 700;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  .panel { position: relative; z-index: 1; background: #fff; border-radius: 16px; border: 1px solid #f1f1f1; box-shadow: 0 14px 40px rgba(0,0,0,0.04); padding: 18px; }
  .panel + .panel { margin-top: 14px; }
  .panel-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
  .label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: #9a9a9a; margin: 0; font-weight: 800; }
  .panel h2 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }

  .grid { margin-top: 14px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }

  .card { border: 1px solid #f0d8d3; border-radius: 14px; padding: 14px; box-shadow: 0 10px 26px rgba(0,0,0,0.04); background: #fffaf8; }
  .card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .card h3 { margin: 4px 0 0 0; font-size: 18px; font-weight: 800; }

  .acciones { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .chip { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 12px; font-weight: 700; border: 1px solid #f0d8d3; background: #fff; cursor: pointer; transition: transform 0.12s ease, box-shadow 0.18s ease; }
  .chip:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(227, 71, 60, 0.12); }
  .chip-on { background: #f2fcf6; border-color: #cce8d8; color: #1d5a39; }
  .chip-off { background: #fff1f1; color: #a33b36; }
  .chip .ms-icon { 
    font-size: 18px; 
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
  }

  .toggle { min-width: 82px; display: inline-flex; align-items: center; gap: 10px; justify-content: space-between; padding: 8px 10px; border-radius: 999px; border: 1px solid #f0d8d3; background: #fff; cursor: pointer; font-weight: 800; color: #a33b36; }
  .toggle .thumb { width: 18px; height: 18px; border-radius: 999px; background: #e3473c; box-shadow: 0 6px 12px rgba(227, 71, 60, 0.32); transform: translateX(0); transition: transform 0.16s ease; }
  .toggle.on { background: #f2fcf6; border-color: #cce8d8; color: #1d5a39; }
  .toggle.on .thumb { transform: translateX(10px); background: #1d5a39; box-shadow: 0 6px 12px rgba(29, 90, 57, 0.28); }

  .primary, .outline, .ghost {
    border-radius: 12px;
    padding: 10px 12px;
    font-weight: 800;
    cursor: pointer;
    border: 1px solid #f0d0cb;
    background: #fff;
    color: #a33b36;
    transition: transform 0.12s ease, box-shadow 0.18s ease;
  }
  .primary { background: linear-gradient(135deg, #e3473c, #c23630); color: #fff; border-color: #f4d5d2; box-shadow: 0 12px 26px rgba(227,71,60,0.25); }
  .outline { background: #fffaf8; }
  .ghost:hover, .outline:hover, .primary:hover { transform: translateY(-1px); }

  .select { padding: 10px 12px; border-radius: 10px; border: 1.5px solid #e6e6e9; font-weight: 700; background: #fff; }

  .loading { display: flex; align-items: center; gap: 12px; padding: 12px; color: #555; font-weight: 600; }
  .loading .spinner { width: 18px; height: 18px; border: 3px solid #f0d8d3; border-top-color: #e3473c; border-radius: 999px; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 720px) {
    .hero { flex-direction: column; align-items: flex-start; }
    .hero-actions { width: 100%; gap: 8px; }
    .hero-actions button { flex: 1; }
  }
</style>
