<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { addNotificacion, auth, setAuthUsuario } from '$lib/stores.js';
	import { authService } from '$lib/api/services.js';

	let correo = '';
	let contraseña = '';
	let loading = false;
	let mostrarContraseña = false;
	export let form;

	function irARecuperarContrasena() {
		console.log('🔄 Navegando a recuperar contraseña...');
		goto('/recuperar-contrasena');
	}

	function handleKeydown(e) {
		if (e.key === 'Enter' && correo && contraseña && !loading) {
			document.querySelector('form').requestSubmit();
		}
	}

	function toggleMostrarContraseña() {
		mostrarContraseña = !mostrarContraseña;
	}

	// Usuarios de prueba
	const usuariosPrueba = [
		{
			nombre: 'Mauricio Fernández',
			rol: 'Coordinador',
			correo: 'mauriciofernandez@gmail.com',
			contraseña: 'Maufz_2025$2'
		},
		{
			nombre: 'Mayra Alejandra Hoyos',
			rol: 'HSEQ',
			correo: 'mayraalejandrahoyos@gmail.com',
			contraseña: 'MayraH@2025!'
		},
		{
			nombre: 'Wilfran Camilo Castellanos',
			rol: 'Administrador',
			correo: 'wilfrancamilocastellanos@gmail.com',
			contraseña: 'WccAdmin#92'
		},
		{
			nombre: 'Yeison Ramírez',
			rol: 'Coordinador',
			correo: 'jasonramirez@gmail.com',
			contraseña: 'JasonR*884'
		}
	];

	function seleccionarUsuario(usuario) {
		correo = usuario.correo;
		contraseña = usuario.contraseña;
	}

	$: if (form?.error) {
		addNotificacion(form.error, 'error');
	}
</script>

<svelte:head>
	<title>Login - TransConecta</title>
	<meta name="description" content="Inicia sesión en TransConecta" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
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
					console.log('🔍 Login result:', result);
					console.log('🔍 Result data:', result.data);
					console.log('🔍 Usuario:', result.data?.usuario);
					console.log('🔍 Requiere cambio:', result.data?.usuario?.requiere_cambio_contrasena);
					
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

						// Verificar si requiere cambio de contraseña
						if (result.data?.usuario?.requiere_cambio_contrasena) {
							console.log('✅ Usuario requiere cambio de contraseña, redirigiendo...');
							addNotificacion('Debes cambiar tu contraseña antes de continuar', 'warning');
							await update();
							await goto('/cambiar-contrasena', { replaceState: true });
							return;
						}

						console.log('✅ Login normal, redirigiendo al dashboard...');
						addNotificacion('¡Bienvenido a TransConecta!', 'success');
						await update();
						
						// Redirigir según el rol
						let target = '/';
						if (result.data?.usuario?.nombre_rol?.toUpperCase() === 'HSEQ') {
							target = '/operaciones/horas';
						} else if (result.data?.location) {
							target = String(result.data.location);
						}
						
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
				<div class="password-wrapper">
					<input
						type={mostrarContraseña ? 'text' : 'password'}
						id="contraseña"
						name="contraseña"
						bind:value={contraseña}
						placeholder="•••••••••"
						required
						disabled={loading}
						on:keydown={handleKeydown}
					/>
					<button
						type="button"
						class="toggle-password"
						on:click={toggleMostrarContraseña}
						aria-label={mostrarContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'}
						disabled={loading}
					>
						<span class="ms-icon">{mostrarContraseña ? 'visibility_off' : 'visibility'}</span>
					</button>
				</div>
			</label>
		</div>			<button
				type="submit"
				class="login-btn"
				disabled={loading || !correo || !contraseña}
			>
				{loading ? 'Iniciando sesión...' : 'Ingresar'}
			</button>

			<div class="form-footer">
				<button 
					type="button" 
					class="link-button"
					on:click={irARecuperarContrasena}
				>
					¿Olvidaste tu contraseña?
				</button>
			</div>
		</form>

		<div class="login-footer">
			<div class="footer-header">
				<span class="ms-icon">group</span>
				<p class="footer-title">Usuarios de prueba</p>
			</div>
			<p class="footer-subtitle">Haz clic en un usuario para autocompletar las credenciales</p>
			<div class="users-grid">
				{#each usuariosPrueba as usuario}
					<button 
						type="button"
						class="user-card" 
						on:click={() => seleccionarUsuario(usuario)}
						disabled={loading}
						title="Clic para usar este usuario"
					>
						<div class="user-avatar">
							<span class="ms-icon">person</span>
						</div>
						<div class="user-info">
							<span class="user-nombre">{usuario.nombre}</span>
							<span class="user-rol">
								<span class="role-badge">{usuario.rol}</span>
							</span>
						</div>
						<span class="ms-icon arrow">arrow_forward</span>
					</button>
				{/each}
			</div>
		</div>
	</section>
</div>

<style>
	:global(.ms-icon) {
		font-family: 'Material Symbols Outlined';
		font-weight: normal;
		font-style: normal;
		font-size: 24px;
		line-height: 1;
		letter-spacing: normal;
		text-transform: none;
		display: inline-block;
		white-space: nowrap;
		word-wrap: normal;
		direction: ltr;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
		font-feature-settings: 'liga';
	}

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

	.password-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.password-wrapper input {
		width: 100%;
		padding-right: 48px;
	}

	.toggle-password {
		position: absolute;
		right: 4px;
		background: transparent;
		border: none;
		padding: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: background 0.2s ease;
		color: #666;
	}

	.toggle-password:hover:not(:disabled) {
		background: #f0f0f2;
		color: #333;
	}

	.toggle-password:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.toggle-password .ms-icon {
		font-size: 20px;
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

	.link-button {
		font-size: 13px;
		color: #a33b36;
		background: none;
		border: none;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
		transition: opacity 0.2s;
	}

	.link-button:hover {
		text-decoration: underline;
		opacity: 0.8;
	}

	.login-footer {
		margin-top: 24px;
		padding: 20px;
		background: linear-gradient(135deg, #fbfbfc 0%, #f5f5f7 100%);
		border: 1.5px solid #e6e6e9;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.footer-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.footer-header .ms-icon {
		font-size: 20px;
		color: #e3473c;
	}

	.footer-title {
		margin: 0;
		font-weight: 700;
		font-size: 14px;
		color: #2a2a2a;
		letter-spacing: 0.02em;
	}

	.footer-subtitle {
		margin: 0 0 8px 0;
		font-size: 12px;
		color: #888;
		text-align: center;
	}

	.users-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.user-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px;
		border: 2px solid #e6e6e9;
		border-radius: 12px;
		background: #ffffff;
		cursor: pointer;
		transition: all 0.25s ease;
		text-align: left;
		gap: 12px;
		position: relative;
		overflow: hidden;
	}

	.user-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, rgba(227, 71, 60, 0.05), rgba(194, 54, 48, 0.05));
		opacity: 0;
		transition: opacity 0.25s ease;
		z-index: 0;
	}

	.user-card:hover:not(:disabled)::before {
		opacity: 1;
	}

	.user-card:hover:not(:disabled) {
		border-color: #e3473c;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(227, 71, 60, 0.15);
	}

	.user-card:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(227, 71, 60, 0.1);
	}

	.user-card:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.user-card > * {
		position: relative;
		z-index: 1;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #e3473c, #c23630);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(227, 71, 60, 0.2);
	}

	.user-avatar .ms-icon {
		font-size: 24px;
		color: white;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 0;
	}

	.user-nombre {
		font-size: 14px;
		font-weight: 600;
		color: #2a2a2a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}

	.user-rol {
		display: flex;
		align-items: center;
	}

	.role-badge {
		font-size: 10px;
		font-weight: 600;
		color: #e3473c;
		background: rgba(227, 71, 60, 0.1);
		padding: 3px 8px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		line-height: 1;
	}

	.user-card .arrow {
		font-size: 20px;
		color: #ccc;
		transition: all 0.25s ease;
		flex-shrink: 0;
	}

	.user-card:hover:not(:disabled) .arrow {
		color: #e3473c;
		transform: translateX(4px) scale(1.1);
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

		.users-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
