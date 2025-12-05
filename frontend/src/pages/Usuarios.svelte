<script>
  import { onMount } from 'svelte';
  import { usuarios, addNotificacion } from '../lib/stores.js';
  import { usuarioService } from '../lib/api/services.js';

  let mostrarFormulario = false;
  let editando = null;
  let formData = {
    nombre_usuario: '',
    correo: '',
    contraseña: '',
    estado: 'activo'
  };

  onMount(async () => {
    await cargarUsuarios();
  });

  async function cargarUsuarios() {
    usuarios.update(u => ({ ...u, loading: true }));
    try {
      const data = await usuarioService.listar();
      usuarios.update(u => ({ ...u, items: data.usuarios || [], loading: false }));
    } catch (error) {
      usuarios.update(u => ({ ...u, error: error.message, loading: false }));
      addNotificacion(error.message, 'error');
    }
  }

  async function handleGuardar() {
    try {
      if (editando) {
        await usuarioService.actualizar(editando.id_usuario, formData);
        addNotificacion('Usuario actualizado', 'success');
      } else {
        await usuarioService.registrar(formData.nombre_usuario, formData.correo, formData.contraseña);
        addNotificacion('Usuario creado', 'success');
      }
      resetFormulario();
      await cargarUsuarios();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  function editarUsuario(usuario) {
    editando = usuario;
    formData = {
      nombre_usuario: usuario.nombre_usuario,
      correo: usuario.correo,
      estado: usuario.estado
    };
    mostrarFormulario = true;
  }

  function resetFormulario() {
    formData = {
      nombre_usuario: '',
      correo: '',
      contraseña: '',
      estado: 'activo'
    };
    editando = null;
    mostrarFormulario = false;
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      if (nuevoEstado === 'inactivo') {
        await usuarioService.inactivar(id);
      } else {
        await usuarioService.activar(id);
      }
      addNotificacion('Estado actualizado', 'success');
      await cargarUsuarios();
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
  }

  async function eliminarUsuario(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await usuarioService.eliminar(id);
        addNotificacion('Usuario eliminado', 'success');
        await cargarUsuarios();
      } catch (error) {
        addNotificacion(error.message, 'error');
      }
    }
  }
</script>

<div class="usuarios-container">
  <div class="header">
    <h1>Gestión de Usuarios</h1>
    <button class="btn btn-primary" on:click={() => (mostrarFormulario = !mostrarFormulario)}>
      {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Usuario'}
    </button>
  </div>

  {#if mostrarFormulario}
    <div class="formulario-card">
      <h2>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
      <form on:submit|preventDefault={handleGuardar}>
        <div class="form-group">
          <label>Nombre de Usuario</label>
          <input type="text" bind:value={formData.nombre_usuario} required />
        </div>

        <div class="form-group">
          <label>Correo</label>
          <input type="email" bind:value={formData.correo} required />
        </div>

        {#if !editando}
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" bind:value={formData.contraseña} required />
          </div>
        {/if}

        <div class="form-group">
          <label>Estado</label>
          <select bind:value={formData.estado}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar</button>
          <button type="button" class="btn btn-secondary" on:click={resetFormulario}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  {/if}

  {#if $usuarios.loading}
    <p class="loading">Cargando usuarios...</p>
  {:else if $usuarios.items.length === 0}
    <p class="empty">No hay usuarios registrados</p>
  {:else}
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each $usuarios.items as usuario}
            <tr>
              <td>{usuario.nombre_usuario}</td>
              <td>{usuario.correo}</td>
              <td>
                <span class="badge badge-{usuario.estado}">
                  {usuario.estado}
                </span>
              </td>
              <td>{new Date(usuario.fecha_creacion).toLocaleDateString()}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-info" on:click={() => editarUsuario(usuario)}>
                    Editar
                  </button>
                  <button
                    class="btn btn-sm {usuario.estado === 'activo' ? 'btn-warning' : 'btn-success'}"
                    on:click={() => cambiarEstado(usuario.id_usuario, usuario.estado === 'activo' ? 'inactivo' : 'activo')}
                  >
                    {usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                  <button class="btn btn-sm btn-danger" on:click={() => eliminarUsuario(usuario.id_usuario)}>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .usuarios-container {
    max-width: 1200px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .header h1 {
    margin: 0;
  }

  .formulario-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .formulario-card h2 {
    margin-top: 0;
  }

  form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
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

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

  th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid #dee2e6;
  }

  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .badge-activo {
    background-color: #d4edda;
    color: #155724;
  }

  .badge-inactivo {
    background-color: #f8d7da;
    color: #721c24;
  }

  .actions {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s;
  }

  .btn-primary {
    background-color: #667eea;
    color: white;
  }

  .btn-primary:hover {
    background-color: #5568d3;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #5a6268;
  }

  .btn-sm {
    padding: 6px 10px;
    font-size: 12px;
  }

  .btn-info {
    background-color: #17a2b8;
    color: white;
  }

  .btn-info:hover {
    background-color: #138496;
  }

  .btn-warning {
    background-color: #ffc107;
    color: #333;
  }

  .btn-warning:hover {
    background-color: #e0a800;
  }

  .btn-success {
    background-color: #28a745;
    color: white;
  }

  .btn-success:hover {
    background-color: #218838;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background-color: #c82333;
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
