<script>
  import { auth, login, addNotificacion } from '../lib/stores.js';
  import { authService } from '../lib/api/services.js';

  let correo = '';
  let contraseña = '';
  let loading = false;

  async function handleLogin() {
    loading = true;
    try {
      const result = await login(correo, contraseña);
      addNotificacion('¡Bienvenido a TransConecta!', 'success');
      window.location.href = '/';
    } catch (error) {
      addNotificacion(error.message, 'error');
    }
    loading = false;
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <h1>TransConecta</h1>
      <p>Gestión de Transporte y Logística</p>
    </div>

    <form on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="correo">Correo Electrónico</label>
        <input
          type="email"
          id="correo"
          bind:value={correo}
          placeholder="correo@example.com"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="contraseña">Contraseña</label>
        <input
          type="password"
          id="contraseña"
          bind:value={contraseña}
          placeholder="•••••••••"
          required
          disabled={loading}
          on:keydown={handleKeydown}
        />
      </div>

      <button
        type="submit"
        class="login-btn"
        disabled={loading || !correo || !contraseña}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>

    <div class="login-footer">
      <p>Credenciales de prueba:</p>
      <code>correo: admin@example.com</code>
      <code>contraseña: password123</code>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .login-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .login-header h1 {
    margin: 0 0 10px 0;
    color: #667eea;
    font-size: 32px;
  }

  .login-header p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: 600;
    color: #333;
  }

  .form-group input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
  }

  .form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-group input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  .login-btn {
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-footer {
    margin-top: 30px;
    padding-top: 30px;
    border-top: 1px solid #eee;
    text-align: center;
    font-size: 13px;
    color: #666;
  }

  .login-footer p {
    margin: 0 0 10px 0;
  }

  .login-footer code {
    display: block;
    padding: 5px;
    background-color: #f5f5f5;
    border-radius: 3px;
    margin: 5px 0;
  }
</style>
