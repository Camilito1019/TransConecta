<script>
  import { onMount } from 'svelte';
  import { asignaciones, vehiculos, conductores, trayectos, addNotificacion } from '../lib/stores.js';
  import { trayectoService, vehiculoService, conductorService } from '../lib/api/services.js';

  let mostrarFormulario = false;
  let formData = {
    id_vehiculo: '',
    id_conductor: '',
    id_trayecto: ''
  };

  onMount(async () => {
    await Promise.all([cargarAsignaciones(), cargarVehiculos(), cargarConductores(), cargarTrayectos()]);
  });

  async function cargarAsignaciones() {
    asignaciones.update(a => ({ ...a, loading: true }));
    try {
      const data = await trayectoService.listarAsignaciones();
      asignaciones.update(a => ({ ...a, items: data.asignaciones || [], loading: false }));
    } catch (error) {
      asignaciones.update(a => ({ ...a, error: error.message, loading: false }));
      addNotificacion(error.message, 'error');
    }
  }

  async function cargarVehiculos() {
    try {
      const data = await vehiculoService.listar();
      vehiculos.update(v => ({ ...v, items: data.vehiculos || [] }));
    } catch (error) {
      console.error(error);
    }
  }

  async function cargarConductores() {
    try {
      const data = await conductorService.listar();
      conductores.update(c => ({ ...c, items: data.conductores || [] }));
    } catch (error) {
      console.error(error);
    }
  }

  async function cargarTrayectos() {
    try {
      const data = await trayectoService.listar();
      trayectos.update(t => ({ ...t, items: data.trayectos || [] }));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAsignar() {
    try {
      await trayectoService.asignarTrayecto(formData);
      addNotificacion('Trayecto asignado', 'success');
      formData = { id_vehiculo: '', id_conductor: '', id_trayecto: '' };
      mostrarFormulario = false;
      await cargarAsignaciones();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  async function desasignar(id_asignacion) {
    if (confirm('¿Desasignar este trayecto?')) {
      try {
        await trayectoService.desasignarTrayecto(id_asignacion);
        addNotificacion('Trayecto desasignado', 'success');
        await cargarAsignaciones();
      } catch (error) {
        addNotificacion(error.message, 'error');
      }
    }
  }
</script>

<div class="asignaciones-container">
  <div class="header">
    <h1>Asignaciones de Trayectos</h1>
    <button class="btn btn-primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
      {mostrarFormulario ? '✕ Cancelar' : '+ Nueva Asignación'}
    </button>
  </div>

  {#if mostrarFormulario}
    <div class="formulario-card">
      <h2>Asignar Trayecto</h2>
      <form on:submit|preventDefault={handleAsignar}>
        <div class="form-group">
          <label>Vehículo</label>
          <select bind:value={formData.id_vehiculo} required>
            <option value="">Seleccionar vehículo</option>
            {#each $vehiculos.items as vehiculo}
              <option value={vehiculo.id_vehiculo}>{vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Conductor</label>
          <select bind:value={formData.id_conductor} required>
            <option value="">Seleccionar conductor</option>
            {#each $conductores.items as conductor}
              <option value={conductor.id_conductor}>{conductor.nombre} {conductor.apellido}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Trayecto</label>
          <select bind:value={formData.id_trayecto} required>
            <option value="">Seleccionar trayecto</option>
            {#each $trayectos.items as trayecto}
              <option value={trayecto.id_trayecto}>{trayecto.origen} → {trayecto.destino}</option>
            {/each}
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Asignar</button>
          <button type="button" class="btn btn-secondary" on:click={() => (mostrarFormulario = false)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  {/if}

  {#if $asignaciones.loading}
    <p class="loading">Cargando asignaciones...</p>
  {:else if $asignaciones.items.length === 0}
    <p class="empty">No hay asignaciones registradas</p>
  {:else}
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Vehículo</th>
            <th>Conductor</th>
            <th>Trayecto</th>
            <th>Distancia</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each $asignaciones.items as asignacion}
            <tr>
              <td>{asignacion.placa || 'N/A'}</td>
              <td>{asignacion.nombre_conductor || 'N/A'} {asignacion.apellido_conductor || ''}</td>
              <td>{asignacion.origen} → {asignacion.destino}</td>
              <td>{asignacion.distancia_km} km</td>
              <td>
                <span class="badge badge-{asignacion.estado_asignacion}">
                  {asignacion.estado_asignacion}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-danger" on:click={() => desasignar(asignacion.id_asignacion)}>
                  Desasignar
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
  .asignaciones-container { max-width: 1200px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .formulario-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
  form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group label { font-weight: 600; }
  .form-group select { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
  .form-actions { grid-column: 1 / -1; display: flex; gap: 10px; }
  .tabla-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
  table { width: 100%; border-collapse: collapse; }
  thead { background-color: #f8f9fa; }
  th, td { padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; }
  th { font-weight: 600; border-bottom: 2px solid #dee2e6; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
  .badge-asignado { background: #cfe2ff; color: #084298; }
  .badge-en_ruta { background: #d1ecf1; color: #0c5460; }
  .badge-completado { background: #d4edda; color: #155724; }
  .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
  .btn-primary { background-color: #667eea; color: white; }
  .btn-secondary { background-color: #6c757d; color: white; }
  .btn-sm { padding: 6px 10px; }
  .btn-danger { background-color: #dc3545; color: white; }
  .loading, .empty { text-align: center; padding: 40px; background: white; border-radius: 8px; color: #666; }
</style>
