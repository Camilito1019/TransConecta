<script>
  import { onMount } from 'svelte';
  import { vehiculos, addNotificacion } from '../lib/stores.js';
  import { vehiculoService } from '../lib/api/services.js';
  import { estadoLabel, estadoClass } from '../lib/status.js';

  let mostrarFormulario = false;
  let editando = null;
  let formData = {
    placa: '',
    modelo: '',
    marca: '',
    año: '',
    capacidad_carga: '',
    estado_operativo: 'operativo'
  };

  onMount(async () => {
    await cargarVehiculos();
  });

  async function cargarVehiculos() {
    vehiculos.update(v => ({ ...v, loading: true }));
    try {
      const data = await vehiculoService.listar();
      vehiculos.update(v => ({ ...v, items: data.vehiculos || [], loading: false }));
    } catch (error) {
      vehiculos.update(v => ({ ...v, error: error.message, loading: false }));
      addNotificacion(error.message, 'error');
    }
  }

  async function handleGuardar() {
    try {
      if (editando) {
        await vehiculoService.actualizar(editando.id_vehiculo, formData);
        addNotificacion('Vehículo actualizado', 'success');
      } else {
        await vehiculoService.crear(formData);
        addNotificacion('Vehículo creado', 'success');
      }
      resetFormulario();
      await cargarVehiculos();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  function editarVehiculo(vehiculo) {
    editando = vehiculo;
    formData = {
      placa: vehiculo.placa,
      modelo: vehiculo.modelo,
      marca: vehiculo.marca,
      año: vehiculo.año,
      capacidad_carga: vehiculo.capacidad_carga,
      estado_operativo: vehiculo.estado_operativo
    };
    mostrarFormulario = true;
  }

  function resetFormulario() {
    formData = {
      placa: '',
      modelo: '',
      marca: '',
      año: '',
      capacidad_carga: '',
      estado_operativo: 'operativo'
    };
    editando = null;
    mostrarFormulario = false;
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      if (nuevoEstado === 'inactivo') {
        await vehiculoService.desactivar(id);
      } else {
        await vehiculoService.activar(id);
      }
      addNotificacion('Estado actualizado', 'success');
      await cargarVehiculos();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }
</script>

<div class="vehiculos-container">
  <div class="header">
    <h1>Gestión de Vehículos</h1>
    <button class="btn btn-primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
      {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Vehículo'}
    </button>
  </div>

  {#if mostrarFormulario}
    <div class="formulario-card">
      <h2>{editando ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
      <form on:submit|preventDefault={handleGuardar}>
        <div class="form-group">
          <label>Placa</label>
          <input type="text" bind:value={formData.placa} required />
        </div>

        <div class="form-group">
          <label>Marca</label>
          <input type="text" bind:value={formData.marca} required />
        </div>

        <div class="form-group">
          <label>Modelo</label>
          <input type="text" bind:value={formData.modelo} required />
        </div>

        <div class="form-group">
          <label>Año</label>
          <input type="number" bind:value={formData.año} required />
        </div>

        <div class="form-group">
          <label>Capacidad de Carga (kg)</label>
          <input type="number" bind:value={formData.capacidad_carga} required />
        </div>

        <div class="form-group">
          <label>Estado Operativo</label>
          <select bind:value={formData.estado_operativo}>
            <option value="operativo">Operativo</option>
            <option value="en_mantenimiento">En Mantenimiento</option>
            <option value="en_ruta">En Ruta</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar</button>
          <button type="button" class="btn btn-secondary" on:click={resetFormulario}>Cancelar</button>
        </div>
      </form>
    </div>
  {/if}

  {#if $vehiculos.loading}
    <p class="loading">Cargando vehículos...</p>
  {:else if $vehiculos.items.length === 0}
    <p class="empty">No hay vehículos registrados</p>
  {:else}
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Capacidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each $vehiculos.items as vehiculo}
            <tr>
              <td>{vehiculo.placa}</td>
              <td>{vehiculo.marca}</td>
              <td>{vehiculo.modelo}</td>
              <td>{vehiculo.año}</td>
              <td>{vehiculo.capacidad_carga} kg</td>
              <td>
                <span class={`status-pill status-${estadoClass(vehiculo.estado_operativo)}`}>
                  {estadoLabel(vehiculo.estado_operativo)}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info" on:click={() => editarVehiculo(vehiculo)}>
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
  .vehiculos-container {
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
    font-size: 14px;
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

  .badge-operativo {
    background: #d4edda;
    color: #155724;
  }

  .badge-en_ruta {
    background: #cfe2ff;
    color: #084298;
  }

  .badge-en_mantenimiento {
    background: #fff3cd;
    color: #664d03;
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

  .loading,
  .empty {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 8px;
    color: #666;
  }
</style>
