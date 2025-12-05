<script>
  import { onMount } from 'svelte';
  import { roles, addNotificacion } from '../lib/stores.js';
  import { rolService } from '../lib/api/services.js';

  let mostrarFormulario = false;
  let editando = null;
  let formData = { nombre: '', descripcion: '' };

  onMount(async () => {
    await cargarRoles();
  });

  async function cargarRoles() {
    roles.update(r => ({ ...r, loading: true }));
    try {
      const data = await rolService.listar();
      roles.update(r => ({ ...r, items: data.roles || [], loading: false }));
    } catch (error) {
      roles.update(r => ({ ...r, error: error.message, loading: false }));
      addNotificacion(error.message, 'error');
    }
  }

  async function handleGuardar() {
    try {
      if (editando) {
        await rolService.actualizar(editando.id_rol, formData.nombre, formData.descripcion);
        addNotificacion('Rol actualizado', 'success');
      } else {
        await rolService.crear(formData.nombre, formData.descripcion);
        addNotificacion('Rol creado', 'success');
      }
      resetFormulario();
      await cargarRoles();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  function editarRol(rol) {
    editando = rol;
    formData = { nombre: rol.nombre, descripcion: rol.descripcion };
    mostrarFormulario = true;
  }

  function resetFormulario() {
    formData = { nombre: '', descripcion: '' };
    editando = null;
    mostrarFormulario = false;
  }

  async function eliminarRol(id) {
    if (confirm('¿Estás seguro?')) {
      try {
        await rolService.eliminar(id);
        addNotificacion('Rol eliminado', 'success');
        await cargarRoles();
      } catch (error) {
        addNotificacion(error.message, 'error');
      }
    }
  }
</script>

<div class="roles-container">
  <div class="header">
    <h1>Gestión de Roles</h1>
    <button class="btn btn-primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
      {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Rol'}
    </button>
  </div>

  {#if mostrarFormulario}
    <div class="formulario-card">
      <form on:submit|preventDefault={handleGuardar}>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" bind:value={formData.nombre} required />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea bind:value={formData.descripcion}></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar</button>
          <button type="button" class="btn btn-secondary" on:click={resetFormulario}>Cancelar</button>
        </div>
      </form>
    </div>
  {/if}

  {#if $roles.loading}
    <p class="loading">Cargando roles...</p>
  {:else if $roles.items.length === 0}
    <p class="empty">No hay roles registrados</p>
  {:else}
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each $roles.items as rol}
            <tr>
              <td>{rol.nombre}</td>
              <td>{rol.descripcion}</td>
              <td>
                <button class="btn btn-sm btn-info" on:click={() => editarRol(rol)}>Editar</button>
                <button class="btn btn-sm btn-danger" on:click={() => eliminarRol(rol.id_rol)}>
                  Eliminar
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
  .roles-container { max-width: 1000px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .formulario-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
  form { display: flex; flex-direction: column; gap: 15px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group label { font-weight: 600; }
  .form-group input, .form-group textarea { padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; }
  .form-actions { display: flex; gap: 10px; }
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
  .btn-danger { background-color: #dc3545; color: white; }
  .loading, .empty { text-align: center; padding: 40px; background: white; border-radius: 8px; color: #666; }
</style>
