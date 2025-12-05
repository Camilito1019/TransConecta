<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { addNotificacion, auth, setAuthUsuario } from '$lib/stores.js';
	import { authService } from '$lib/api/services.js';

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

<div class="login-shell">
	<div class="shape shape-a" aria-hidden="true"></div>
	<div class="shape shape-b" aria-hidden="true"></div>

	<section class="login-card">
		<header class="login-header">
			<p class="eyebrow">Plataforma logística</p>
			<h1>TransConecta</h1>
			<p class="subtitle">Opera tu red de transporte con seguridad y claridad.</p>
		</header>

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success' && result.data?.success !== false) {
						const token = result.data?.token ? String(result.data.token) : null;
						if (token) {
							localStorage.setItem('auth_token', token);
							authService.setToken(token);
							auth.update((state) => ({
								...state,
								token,
								isAuthenticated: true,
							}));
							if (result.data?.usuario) {
								setAuthUsuario(result.data.usuario);
							}
							addNotificacion('¡Bienvenido a TransConecta!', 'success');
							await update();
							const target = result.data?.location ? String(result.data.location) : '/';
							await goto(target, { replaceState: true });
						} else {
							addNotificacion('No se recibió token del servidor', 'error');
						}
					} else {
						const errorMsg = result.data?.error || 'Error al iniciar sesión';
						addNotificacion(errorMsg, 'error');
					}
				};
			}}
		>
			<div class="form-grid">
				<label class="form-field">
					<span>Correo electrónico</span>
					<input
						type="email"
						id="correo"
						name="correo"
						bind:value={correo}
						placeholder="correo@example.com"
						required
						disabled={loading}
					/>
				</label>

				<label class="form-field">
					<span>Contraseña</span>
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
				</label>
			</div>

			<button
				type="submit"
				class="login-btn"
				disabled={loading || !correo || !contraseña}
			>
				{loading ? 'Iniciando sesión...' : 'Ingresar'}
			</button>

			<div class="form-footer">
				<a href="/cambio-contrasena">¿Olvidaste tu contraseña?</a>
			</div>
		</form>

		<div class="login-footer">
			<p>Acceso de prueba</p>
			<div class="pill">correo: admin@example.com</div>
			<div class="pill">contraseña: password123</div>
		</div>
	</section>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');

	:global(html),
	:global(body) {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
		background: #f7f7f8;
		color: #1f1f1f;
	}

	.login-shell {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px 18px;
		overflow: hidden;
	}

	.shape {
		position: absolute;
		border-radius: 999px;
		filter: blur(70px);
		opacity: 0.4;
	}

	.shape-a {
		width: 360px;
		height: 360px;
		background: #f6c3c3;
		top: -120px;
		left: -80px;
	}

	.shape-b {
		width: 320px;
		height: 320px;
		background: #ffd8cf;
		bottom: -140px;
		right: -60px;
	}

	.login-card {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 460px;
		background: #ffffff;
		border-radius: 18px;
		box-shadow: 0 20px 80px rgba(0, 0, 0, 0.08);
		padding: 36px 32px;
		border: 1px solid #f0f0f0;
		animation: fadeIn 0.5s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.login-header {
		display: grid;
		gap: 6px;
		text-align: center;
		margin-bottom: 28px;
	}

	.eyebrow {
		margin: 0 auto;
		padding: 6px 12px;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #a33b36;
		background: #fff1f1;
		border-radius: 999px;
		width: fit-content;
		font-weight: 700;
	}

	.login-header h1 {
		margin: 4px 0 0 0;
		font-size: 32px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #2a2a2a;
	}

	.subtitle {
		margin: 0;
		font-size: 15px;
		color: #555;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.form-grid {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 14px;
		color: #1f1f1f;
		font-weight: 600;
	}

	.form-field span {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #444;
		letter-spacing: 0.01em;
	}

	.form-field input {
		padding: 14px 14px;
		border-radius: 12px;
		border: 1.5px solid #e6e6e9;
		background: #fbfbfc;
		font-size: 15px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
		font-family: inherit;
	}

	.form-field input:focus {
		outline: none;
		border-color: #e3473c;
		box-shadow: 0 10px 30px rgba(227, 71, 60, 0.12);
		background: #ffffff;
	}

	.form-field input::placeholder {
		color: #a0a0a5;
	}

	.form-field input:disabled {
		background: #f2f2f4;
		cursor: not-allowed;
	}

	.login-btn {
		padding: 14px 16px;
		border: none;
		border-radius: 12px;
		background: linear-gradient(120deg, #e3473c 0%, #c23630 100%);
		color: #ffffff;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
		box-shadow: 0 14px 30px rgba(227, 71, 60, 0.25);
		letter-spacing: 0.01em;
	}

	.login-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 16px 36px rgba(227, 71, 60, 0.32);
	}

	.login-btn:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 10px 28px rgba(227, 71, 60, 0.22);
	}

	.login-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.form-footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 4px;
	}

	.form-footer a {
		font-size: 13px;
		color: #a33b36;
		text-decoration: none;
		font-weight: 600;
	}

	.form-footer a:hover {
		text-decoration: underline;
	}

	.login-footer {
		margin-top: 22px;
		padding: 16px;
		background: #fbfbfc;
		border: 1px dashed #e6e6e9;
		border-radius: 14px;
		display: grid;
		gap: 10px;
		text-align: center;
	}

	.login-footer p {
		margin: 0;
		font-weight: 700;
		color: #404040;
		letter-spacing: 0.01em;
	}

	.pill {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: 10px 12px;
		border-radius: 12px;
		background: #fff1f1;
		color: #a33b36;
		font-family: 'Manrope', monospace;
		font-size: 13px;
		border: 1px solid #f3d4d4;
	}

	@media (max-width: 540px) {
		.login-card {
			padding: 28px 22px;
		}

		.login-header h1 {
			font-size: 28px;
		}

		.subtitle {
			font-size: 14px;
		}

		.login-footer {
			grid-template-columns: 1fr;
		}
	}
</style>
