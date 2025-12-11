<script>
	import { goto } from '$app/navigation';
	import { addNotificacion } from '$lib/stores.js';

	let paso = 1; // 1: solicitar correo, 2: ingresar OTP, 3: nueva contraseña
	let correo = '';
	let codigo = '';
	let nueva_contrasena = '';
	let confirmar_contrasena = '';
	let token = '';
	let loading = false;
	let mostrarContrasena = false;
	let mostrarConfirmar = false;
	let intentosRestantes = 3;

	// Validaciones reactivas
	$: contrasenaValida = nueva_contrasena && nueva_contrasena.length >= 6;
	$: contrasenasCoinciden = nueva_contrasena && confirmar_contrasena && nueva_contrasena === confirmar_contrasena;
	$: formularioValido = contrasenaValida && contrasenasCoinciden && token && !loading;

	// Función para limpiar el código OTP (solo números)
	function limpiarCodigo(valor) {
		return valor.replace(/\D/g, '').slice(0, 6);
	}

	// Reactivo para limpiar el código automáticamente
	$: codigo = limpiarCodigo(codigo);

	async function solicitarOTP() {
		if (!correo) {
			addNotificacion('Por favor ingresa tu correo', 'error');
			return;
		}

		loading = true;
		try {
			console.log('Enviando solicitud OTP para:', correo);
			const response = await fetch('http://localhost:3000/api/solicitar-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ correo })
			});

			console.log('Respuesta status:', response.status);
			const data = await response.json();
			console.log('Respuesta data:', data);

			if (!response.ok) {
				throw new Error(data.error || 'Error al solicitar código');
			}

			addNotificacion('Código enviado a tu correo', 'success');
			paso = 2;
		} catch (error) {
			console.error('Error al solicitar OTP:', error);
			addNotificacion(error.message, 'error');
		} finally {
			loading = false;
		}
	}

	async function verificarOTP() {
		if (!codigo || codigo.length !== 6) {
			addNotificacion('Ingresa un código de 6 dígitos', 'error');
			return;
		}

		loading = true;
		try {
			const response = await fetch('http://localhost:3000/api/verificar-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ correo, codigo })
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.intentosRestantes !== undefined) {
					intentosRestantes = data.intentosRestantes;
				}
				throw new Error(data.error || 'Código incorrecto');
			}

			token = data.token;
			addNotificacion('Código verificado correctamente', 'success');
			paso = 3;
		} catch (error) {
			addNotificacion(error.message, 'error');
		} finally {
			loading = false;
		}
	}

	async function restablecerContrasena() {
		console.log('🔄 restablecerContrasena llamada');
		console.log('📧 Correo:', correo);
		console.log('🔑 Token:', token);
		console.log('🔒 Nueva contraseña:', nueva_contrasena ? '***' : 'vacía');
		console.log('✅ Confirmar contraseña:', confirmar_contrasena ? '***' : 'vacía');
		
		if (!nueva_contrasena || nueva_contrasena.length < 6) {
			console.log('❌ Error: contraseña muy corta');
			addNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
			return;
		}

		if (nueva_contrasena !== confirmar_contrasena) {
			console.log('❌ Error: contraseñas no coinciden');
			addNotificacion('Las contraseñas no coinciden', 'error');
			return;
		}

		if (!token) {
			console.log('❌ Error: token no disponible');
			addNotificacion('Token no disponible. Por favor verifica el código OTP nuevamente', 'error');
			return;
		}

		loading = true;
		try {
			console.log('📤 Enviando petición al backend...');
			const response = await fetch('http://localhost:3000/api/restablecer-contrasena', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ correo, token, nueva_contrasena })
			});

			console.log('📥 Respuesta recibida:', response.status);
			const data = await response.json();
			console.log('📦 Data:', data);

			if (!response.ok) {
				throw new Error(data.error || 'Error al restablecer contraseña');
			}

			console.log('✅ Contraseña restablecida exitosamente');
			addNotificacion('Contraseña restablecida exitosamente', 'success');
			setTimeout(() => goto('/login'), 2000);
		} catch (error) {
			console.error('❌ Error al restablecer:', error);
			addNotificacion(error.message, 'error');
		} finally {
			loading = false;
		}
	}

	function volverAlLogin() {
		goto('/login');
	}
</script>

<svelte:head>
	<title>Recuperar Contraseña - TransConecta</title>
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>

<div class="recovery-shell">
	<div class="shape shape-a" aria-hidden="true"></div>
	<div class="shape shape-b" aria-hidden="true"></div>

	<section class="recovery-card">
		<header class="recovery-header">
			<button class="back-btn" on:click={volverAlLogin} aria-label="Volver al login">
				<span class="ms-icon">arrow_back</span>
			</button>
			<h1>Recuperar Contraseña</h1>
			<p class="subtitle">
				{#if paso === 1}
					Ingresa tu correo para recibir un código de verificación
				{:else if paso === 2}
					Ingresa el código que enviamos a tu correo
				{:else}
					Crea una nueva contraseña segura
				{/if}
			</p>
		</header>

		<div class="steps-indicator">
			<div class="step" class:active={paso >= 1} class:completed={paso > 1}>
				<span class="step-number">1</span>
				<span class="step-label">Correo</span>
			</div>
			<div class="step-line" class:completed={paso > 1}></div>
			<div class="step" class:active={paso >= 2} class:completed={paso > 2}>
				<span class="step-number">2</span>
				<span class="step-label">Código</span>
			</div>
			<div class="step-line" class:completed={paso > 2}></div>
			<div class="step" class:active={paso >= 3}>
				<span class="step-number">3</span>
				<span class="step-label">Nueva contraseña</span>
			</div>
		</div>

		{#if paso === 1}
			<form on:submit|preventDefault={solicitarOTP}>
				<div class="form-field">
					<label for="correo">Correo electrónico</label>
					<input
						type="email"
						id="correo"
						bind:value={correo}
						placeholder="correo@example.com"
						required
						disabled={loading}
					/>
				</div>

				<button type="submit" class="btn-primary" disabled={loading || !correo}>
					{loading ? 'Enviando...' : 'Enviar código'}
				</button>
			</form>
		{/if}

		{#if paso === 2}
			<form on:submit|preventDefault={verificarOTP}>
				<div class="info-box">
					<span class="ms-icon">mail</span>
					<p>Enviamos un código de 6 dígitos a <strong>{correo}</strong></p>
				</div>

				<div class="form-field">
					<label for="codigo">Código de verificación</label>
					<input
						type="text"
						id="codigo"
						bind:value={codigo}
						placeholder="000000"
						maxlength="6"
						inputmode="numeric"
						autocomplete="one-time-code"
						disabled={loading}
						class="otp-input"
					/>
					<small>Intentos restantes: {intentosRestantes}</small>
				</div>

				<button type="submit" class="btn-primary" disabled={loading || codigo.length !== 6}>
					{loading ? 'Verificando...' : 'Verificar código'}
				</button>

				<button type="button" class="btn-secondary" on:click={solicitarOTP} disabled={loading}>
					Reenviar código
				</button>
			</form>
		{/if}

		{#if paso === 3}
			<form on:submit|preventDefault={restablecerContrasena}>
				<div class="form-field">
					<label for="nueva_contrasena">Nueva contraseña</label>
					<div class="password-wrapper">
						<input
							type={mostrarContrasena ? 'text' : 'password'}
							id="nueva_contrasena"
							bind:value={nueva_contrasena}
							placeholder="Mínimo 6 caracteres"
							required
							disabled={loading}
						/>
						<button
							type="button"
							class="toggle-password"
							on:click={() => (mostrarContrasena = !mostrarContrasena)}
							disabled={loading}
						>
							<span class="ms-icon">{mostrarContrasena ? 'visibility_off' : 'visibility'}</span>
						</button>
					</div>
					{#if nueva_contrasena && nueva_contrasena.length < 6}
						<small class="error-text">⚠️ La contraseña debe tener al menos 6 caracteres</small>
					{:else if contrasenaValida}
						<small class="success-text">✓ Contraseña válida</small>
					{/if}
				</div>

				<div class="form-field">
					<label for="confirmar_contrasena">Confirmar contraseña</label>
					<div class="password-wrapper">
						<input
							type={mostrarConfirmar ? 'text' : 'password'}
							id="confirmar_contrasena"
							bind:value={confirmar_contrasena}
							placeholder="Confirma tu contraseña"
							required
							disabled={loading}
						/>
						<button
							type="button"
							class="toggle-password"
							on:click={() => (mostrarConfirmar = !mostrarConfirmar)}
							disabled={loading}
						>
							<span class="ms-icon">{mostrarConfirmar ? 'visibility_off' : 'visibility'}</span>
						</button>
					</div>
					{#if confirmar_contrasena && !contrasenasCoinciden}
						<small class="error-text">⚠️ Las contraseñas no coinciden</small>
					{:else if contrasenasCoinciden}
						<small class="success-text">✓ Las contraseñas coinciden</small>
					{/if}
				</div>

				<button
					type="submit"
					class="btn-primary"
					disabled={!formularioValido}
					title={!formularioValido ? 'Completa todos los campos correctamente' : 'Restablecer contraseña'}
				>
					{loading ? 'Restableciendo...' : 'Restablecer contraseña'}
				</button>
			</form>
		{/if}
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
	}

	.recovery-shell {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px 18px;
		overflow: hidden;
		background: #f7f7f8;
		font-family: 'Manrope', sans-serif;
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
		right: -100px;
	}

	.recovery-card {
		position: relative;
		width: 100%;
		max-width: 480px;
		background: #ffffff;
		border-radius: 20px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
		padding: 32px;
	}

	.recovery-header {
		text-align: center;
		margin-bottom: 24px;
		position: relative;
	}

	.back-btn {
		position: absolute;
		left: 0;
		top: 0;
		background: #f5f5f5;
		border: none;
		border-radius: 8px;
		padding: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.back-btn:hover {
		background: #e6e6e9;
	}

	.recovery-header h1 {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 800;
		color: #2a2a2a;
	}

	.subtitle {
		margin: 0;
		font-size: 14px;
		color: #666;
	}

	.steps-indicator {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 32px;
		padding: 0 20px;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.step-number {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #e6e6e9;
		color: #999;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
		transition: all 0.3s;
	}

	.step.active .step-number {
		background: #e3473c;
		color: white;
	}

	.step.completed .step-number {
		background: #4caf50;
		color: white;
	}

	.step-label {
		font-size: 11px;
		color: #999;
		font-weight: 600;
		text-transform: uppercase;
	}

	.step.active .step-label {
		color: #e3473c;
	}

	.step-line {
		flex: 1;
		height: 2px;
		background: #e6e6e9;
		transition: background 0.3s;
	}

	.step-line.completed {
		background: #4caf50;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-field label {
		font-size: 14px;
		font-weight: 600;
		color: #444;
	}

	.form-field input {
		padding: 14px;
		border-radius: 12px;
		border: 1.5px solid #e6e6e9;
		background: #fbfbfc;
		font-size: 15px;
		transition: all 0.2s;
		font-family: inherit;
	}

	.form-field input:focus {
		outline: none;
		border-color: #e3473c;
		box-shadow: 0 10px 30px rgba(227, 71, 60, 0.12);
		background: #ffffff;
	}

	.otp-input {
		text-align: center;
		font-size: 24px;
		letter-spacing: 8px;
		font-weight: 700;
	}

	.form-field small {
		font-size: 12px;
		color: #999;
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
		border-radius: 8px;
		transition: background 0.2s;
		color: #666;
	}

	.toggle-password:hover:not(:disabled) {
		background: #f0f0f2;
	}

	.info-box {
		background: #e8f5e9;
		border-left: 4px solid #4caf50;
		padding: 14px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.info-box .ms-icon {
		color: #4caf50;
	}

	.info-box p {
		margin: 0;
		font-size: 14px;
		color: #2e7d32;
	}

	.btn-primary,
	.btn-secondary {
		padding: 14px 16px;
		border: none;
		border-radius: 12px;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: linear-gradient(120deg, #e3473c 0%, #c23630 100%);
		color: white;
		box-shadow: 0 14px 30px rgba(227, 71, 60, 0.25);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 16px 36px rgba(227, 71, 60, 0.32);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: transparent;
		color: #e3473c;
		border: 1.5px solid #e3473c;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #fff9f9;
	}

	.error-text {
		color: #d32f2f;
		font-size: 12px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.success-text {
		color: #4caf50;
		font-size: 12px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	@media (max-width: 540px) {
		.recovery-card {
			padding: 24px 20px;
		}

		.steps-indicator {
			padding: 0 10px;
		}

		.step-label {
			font-size: 9px;
		}

		.step-number {
			width: 32px;
			height: 32px;
		}
	}
</style>
