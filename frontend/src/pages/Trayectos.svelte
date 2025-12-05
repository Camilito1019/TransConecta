<script>
  import { onMount } from 'svelte';
  import { trayectos, addNotificacion } from '../lib/stores.js';
  import { trayectoService } from '../lib/api/services.js';

  let mostrarFormulario = false;
  let editando = null;
  let formData = {
    origen: '',
    destino: '',
    distancia_km: '',
    tiempo_estimado: ''
  };

  onMount(async () => {
    await cargarTrayectos();
  });

  async function cargarTrayectos() {
    trayectos.update(t => ({ ...t, loading: true }));
    try {
      const data = await trayectoService.listar();
      trayectos.update(t => ({ ...t, items: data.trayectos || [], loading: false }));
    } catch (error) {
      trayectos.update(t => ({ ...t, error: error.message, loading: false }));
      addNotificacion(error.message, 'error');
    }
  }

  async function handleGuardar() {
    try {
      if (editando) {
        await trayectoService.actualizar(editando.id_trayecto, formData);
        addNotificacion('Trayecto actualizado', 'success');
      } else {
        await trayectoService.crear(formData);
        addNotificacion('Trayecto creado', 'success');
      }
      resetFormulario();
      await cargarTrayectos();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  function editarTrayecto(trayecto) {
    editando = trayecto;
    formData = {
      origen: trayecto.origen,
      destino: trayecto.destino,
      distancia_km: trayecto.distancia_km,
      tiempo_estimado: trayecto.tiempo_estimado
    };
    mostrarFormulario = true;
  }

  function resetFormulario() {
    formData = {
      origen: '',
      destino: '',
      distancia_km: '',
      tiempo_estimado: ''
    };
    editando = null;
    mostrarFormulario = false;
  }
</script>

<div class="trayectos-container">
  <div class="header">
    <h1>Gestión de Trayectos</h1>
    <button class="btn btn-primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
      {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Trayecto'}
    </button>
  </div>

  {#if mostrarFormulario}
    <div class="formulario-card">
      <h2>{editando ? 'Editar Trayecto' : 'Nuevo Trayecto'}</h2>
      <form on:submit|preventDefault={handleGuardar}>
        <div class="form-group">
          <label>Origen</label>
          <input type="text" bind:value={formData.origen} required />
        </div>

        <div class="form-group">
          <label>Destino</label>
          <input type="text" bind:value={formData.destino} required />
        </div>

        <div class="form-group">
          <label>Distancia (km)</label>
          <input type="number" bind:value={formData.distancia_km} required />
        </div>

        <div class="form-group">
          <label>Tiempo Estimado (horas)</label>
          <input type="number" bind:value={formData.tiempo_estimado} required />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar</button>
          <button type="button" class="btn btn-secondary" on:click={resetFormulario}>Cancelar</button>
        </div>
      </form>
    </div>
  {/if}

  {#if $trayectos.loading}
    <p class="loading">Cargando trayectos...</p>
  {:else if $trayectos.items.length === 0}
    <p class="empty">No hay trayectos registrados</p>
  {:else}
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Origen</th>
            <th>Destino</th>
            <th>Distancia</th>
            <th>Tiempo Est.</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each $trayectos.items as trayecto}
            <tr>
              <td>{trayecto.origen}</td>
              <td>{trayecto.destino}</td>
              <td>{trayecto.distancia_km} km</td>
              <td>{trayecto.tiempo_estimado} h</td>
              <td>
                <button class="btn btn-sm btn-info" on:click={() => editarTrayecto(trayecto)}>
                  Editar
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .trayectos-container { max-width: 1200px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .formulario-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
  form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group label { font-weight: 600; font-size: 14px; }
  .form-group input, .form-group select { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
  .form-actions { grid-column: 1 / -1; display: flex; gap: 10px; }
  .tabla-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
  table { width: 100%; border-collapse: collapse; }
  thead { background-color: #f8f9fa; }
  th, td { padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; }
  th { font-weight: 600; border-bottom: 2px solid #dee2e6; }
  .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
  .btn-primary { background-color: #667eea; color: white; }
  .btn-secondary { background-color: #6c757d; color: white; }
  .btn-sm { padding: 6px 10px; }
  .btn-info { background-color: #17a2b8; color: white; }
  .loading, .empty { text-align: center; padding: 40px; background: white; border-radius: 8px; color: #666; }
</style>
