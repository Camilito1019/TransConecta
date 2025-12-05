<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { addNotificacion } from '$lib/stores.js';

	let correo = '';
	let contraseña = '';
	let loading = false;
	export let form;

	function handleKeydown(e) {
		if (e.key === 'Enter' && correo && contraseña && !loading) {
			document.querySelector('form').requestSubmit();
		}
	}

	$: if (form?.error) {
		addNotificacion(form.error, 'error');
	}
</script>

<svelte:head>
	<title>Login - TransConecta</title>
	<meta name="description" content="Inicia sesión en TransConecta" />
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="login-header">
			<h1>TransConecta</h1>
			<p>Gestión de Transporte y Logística</p>
		</div>

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					loading = false;
					if (result.type === 'redirect') {
						addNotificacion('¡Bienvenido a TransConecta!', 'success');
						// Esperar un momento para mostrar la notificación, luego redirigir
						setTimeout(() => {
							goto(result.location);
						}, 500);
					} else if (result.type === 'failure') {
						addNotificacion(result.data?.error || 'Error al iniciar sesión', 'error');
					}
				};
			}}
		>
			<div class="form-group">
				<label for="correo">Correo Electrónico</label>
				<input
					type="email"
					id="correo"
					name="correo"
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
					name="contraseña"
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
	:global(html),
	:global(body) {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
	}

	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		flex: 1;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.login-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		padding: 60px 40px;
		width: 100%;
		max-width: 420px;
		animation: slideUp 0.5s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.login-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.login-header h1 {
		margin: 0 0 10px 0;
		color: #667eea;
		font-size: 36px;
		font-weight: 700;
		letter-spacing: -0.5px;
	}

	.login-header p {
		margin: 0;
		color: #888;
		font-size: 15px;
		font-weight: 400;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.form-group label {
		font-weight: 600;
		color: #333;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-group input {
		padding: 14px 16px;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 15px;
		transition: all 0.3s ease;
		background: #f8f9fa;
		font-family: inherit;
	}

	.form-group input:focus {
		outline: none;
		border-color: #667eea;
		background: white;
		box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
	}

	.form-group input::placeholder {
		color: #bbb;
	}

	.form-group input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.login-btn {
		padding: 14px 16px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 10px;
	}

	.login-btn:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
	}

	.login-btn:active:not(:disabled) {
		transform: translateY(-1px);
	}

	.login-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.login-footer {
		margin-top: 40px;
		padding-top: 30px;
		border-top: 2px solid #f0f0f0;
		text-align: center;
		font-size: 13px;
		color: #888;
	}

	.login-footer p {
		margin: 0 0 14px 0;
		font-weight: 600;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.login-footer code {
		display: block;
		padding: 10px 12px;
		background-color: #f8f9fa;
		border-radius: 6px;
		margin: 8px 0;
		font-size: 12px;
		color: #333;
		font-family: 'Monaco', 'Menlo', monospace;
		border: 1px solid #e0e0e0;
	}

	/* Responsive */
	@media (max-width: 480px) {
		.login-card {
			padding: 40px 25px;
		}

		.login-header h1 {
			font-size: 28px;
		}

		.login-header p {
			font-size: 14px;
		}

		form {
			gap: 18px;
		}

		.form-group input {
			padding: 12px 14px;
			font-size: 16px;
		}
	}
</style>
