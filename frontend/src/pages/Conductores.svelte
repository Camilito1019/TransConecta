<script>
  import { onMount } from 'svelte';
  import { conductores, addNotificacion } from '../lib/stores.js';
  import { conductorService } from '../lib/api/services.js';
  import { estadoLabel, estadoClass } from '../lib/status.js';

  let mostrarFormulario = false;
  let editando = null;
  let selectedConductor = null;
  let showHoras = false;
  let horasData = { hora_inicio: '', hora_fin: '' };

  let formData = {
    nombre: '',
    apellido: '',
    numero_identificacion: '',
    numero_licencia: '',
    estado: 'activo'
  };

  onMount(async () => {
    await cargarConductores();
  });

  async function cargarConductores() {
    conductores.update(c => ({ ...c, loading: true }));
    try {
      const data = await conductorService.listar();
      conductores.update(c => ({ ...c, items: data.conductores || [], loading: false }));
    } catch (error) {
      conductores.update(c => ({ ...c, error: error.message, loading: false }));
      addNotificacion(error.message, 'error');
    }
  }

  async function handleGuardar() {
    try {
      if (editando) {
        await conductorService.actualizar(editando.id_conductor, formData);
        addNotificacion('Conductor actualizado', 'success');
      } else {
        await conductorService.crear(formData);
        addNotificacion('Conductor creado', 'success');
      }
      resetFormulario();
      await cargarConductores();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  async function registrarHoras() {
    try {
      await conductorService.registrarHoras(selectedConductor.id_conductor, horasData);
      addNotificacion('Horas registradas', 'success');
      showHoras = false;
      horasData = { hora_inicio: '', hora_fin: '' };
      await cargarConductores();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  function editarConductor(conductor) {
    editando = conductor;
    formData = {
      nombre: conductor.nombre,
      apellido: conductor.apellido,
      numero_identificacion: conductor.numero_identificacion,
      numero_licencia: conductor.numero_licencia,
      estado: conductor.estado
    };
    mostrarFormulario = true;
  }

  function resetFormulario() {
    formData = {
      nombre: '',
      apellido: '',
      numero_identificacion: '',
      numero_licencia: '',
      estado: 'activo'
    };
    editando = null;
    mostrarFormulario = false;
  }
</script>

<div class="conductores-container">
  <div class="header">
    <h1>Gestión de Conductores</h1>
    <button class="btn btn-primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
      {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Conductor'}
    </button>
  </div>

  {#if mostrarFormulario}
    <div class="formulario-card">
      <h2>{editando ? 'Editar Conductor' : 'Nuevo Conductor'}</h2>
      <form on:submit|preventDefault={handleGuardar}>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" bind:value={formData.nombre} required />
        </div>

        <div class="form-group">
          <label>Apellido</label>
          <input type="text" bind:value={formData.apellido} required />
        </div>

        <div class="form-group">
          <label>Número de Identificación</label>
          <input type="text" bind:value={formData.numero_identificacion} required />
        </div>

        <div class="form-group">
          <label>Número de Licencia</label>
          <input type="text" bind:value={formData.numero_licencia} required />
        </div>

        <div class="form-group">
          <label>Estado</label>
          <select bind:value={formData.estado}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar</button>
          <button type="button" class="btn btn-secondary" on:click={resetFormulario}>Cancelar</button>
        </div>
      </form>
    </div>
  {/if}

  {#if $conductores.loading}
    <p class="loading">Cargando conductores...</p>
  {:else if $conductores.items.length === 0}
    <p class="empty">No hay conductores registrados</p>
  {:else}
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Identificación</th>
            <th>Licencia</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each $conductores.items as conductor}
            <tr>
              <td>{conductor.nombre}</td>
              <td>{conductor.apellido}</td>
              <td>{conductor.numero_identificacion}</td>
              <td>{conductor.numero_licencia}</td>
              <td>
                <span class={`status-pill status-${estadoClass(conductor.estado)}`}>
                  {estadoLabel(conductor.estado)}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-info" on:click={() => editarConductor(conductor)}>
                    Editar
                  </button>
                  <button class="btn btn-sm btn-warning" on:click={() => {
                    selectedConductor = conductor;
                    showHoras = true;
                  }}>
                    Horas
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if showHoras && selectedConductor}
    <div class="modal-overlay" on:click={() => (showHoras = false)}>
      <div class="modal" on:click|stopPropagation>
        <h3>Registrar Horas - {selectedConductor.nombre} {selectedConductor.apellido}</h3>
        <form on:submit|preventDefault={registrarHoras}>
          <div class="form-group">
            <label>Hora Inicio</label>
            <input type="time" bind:value={horasData.hora_inicio} required />
          </div>
          <div class="form-group">
            <label>Hora Fin</label>
            <input type="time" bind:value={horasData.hora_fin} required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Guardar</button>
            <button type="button" class="btn btn-secondary" on:click={() => (showHoras = false)}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .conductores-container {
    max-width: 1200px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .formulario-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-group label {
    font-weight: 600;
    font-size: 14px;
  }

  .form-group input,
  .form-group select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .form-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 10px;
  }

  .tabla-container {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background-color: #f8f9fa;
  }

  th,
  td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }

  th {
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
  }

  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
  }

  .badge-activo {
    background: #d4edda;
    color: #155724;
  }

  .badge-inactivo {
    background: #f8d7da;
    color: #721c24;
  }

  .actions {
    display: flex;
    gap: 5px;
  }

  .btn {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }

  .btn-primary {
    background-color: #667eea;
    color: white;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-sm {
    padding: 6px 10px;
  }

  .btn-info {
    background-color: #17a2b8;
    color: white;
  }

  .btn-warning {
    background-color: #ffc107;
    color: #333;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 400px;
    width: 90%;
  }

  .loading,
  .empty {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 8px;
    color: #666;
  }
</style>
