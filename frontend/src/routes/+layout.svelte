<script>
	import Navbar from '$components/Navbar.svelte';
	import Sidebar from '$components/Sidebar.svelte';
	import Notificaciones from '$components/Notificaciones.svelte';
	import { auth, setAuthUsuario, addNotificacion } from '$lib/stores.js';
	import { authService } from '$lib/api/services.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import '../app.css';

	export let data;

	let sidebarOpen = true;
	let mounted = false;
	let fetchedProfile = false;
	let previousAuthState = false;

	// Sincronizar token INMEDIATAMENTE (antes de onMount)
	if (typeof window !== 'undefined') {
		const fromLocalStorage = localStorage.getItem('auth_token');
		const fromCookie = document.cookie
			.split('; ')
			.find((row) => row.startsWith('auth_token='))
			?.split('=')[1];

		const token = fromLocalStorage || fromCookie;
		if (token) {
			localStorage.setItem('auth_token', token);
			authService.setToken(token);
			auth.update((state) => ({
				...state,
				token,
				isAuthenticated: true,
			}));
		}
	}

	onMount(async () => {
		// Solo cargar perfil si hay token
		const token = authService.getToken();
		if (token && !fetchedProfile) {
			await cargarPerfil();
		}
		mounted = true;
	});

	// Hidrata el store antes de montar si el token viene del load SSR
	if (data?.token) {
		auth.update((state) => ({ ...state, token: data.token, isAuthenticated: true }));
	}

	$: isAuthed = mounted ? $auth.isAuthenticated : Boolean(data?.token);
	$: isLoginPage = $page.route.id === '/login';
	$: isRecuperarPage = $page.route.id === '/recuperar-contrasena';
	$: isCambiarContrasenaPage = $page.route.id === '/cambiar-contrasena';
	$: requiereCambioContrasena = $auth?.usuario?.requiere_cambio_contrasena === true;
	$: isPublicPage = isLoginPage || isRecuperarPage;
	$: mostrarSinNavegacion = isPublicPage || (isCambiarContrasenaPage && requiereCambioContrasena);

	// Debug
	$: if (mounted) {
		console.log('📍 Layout Debug:', {
			route: $page.route.id,
			isAuthed,
			requiereCambioContrasena,
			mostrarSinNavegacion,
			isCambiarContrasenaPage
		});
	}
	$: perfilCargado = fetchedProfile && ($auth.usuario !== null || !$auth.isAuthenticated);
	
	// Detectar cambios en autenticación y resetear fetchedProfile si es necesario
	$: if ($auth.isAuthenticated !== previousAuthState) {
		previousAuthState = $auth.isAuthenticated;
		if ($auth.isAuthenticated) {
			// Usuario acaba de loguearse, resetear para que se cargue el perfil
			fetchedProfile = false;
		} else {
			// Usuario se deslogueó, marcar como "cargado" para no intentar cargar
			fetchedProfile = true;
		}
	}
	
	// Efecto reactivo: cargar perfil cuando el usuario se autentica
	$: if (mounted && $auth.isAuthenticated && !fetchedProfile && !isPublicPage && !requiereCambioContrasena) {
		cargarPerfil();
	}

	// Redirigir a cambiar contraseña si es requerido y no está en esa página o páginas públicas
	$: if (mounted && requiereCambioContrasena && !isCambiarContrasenaPage && !isPublicPage) {
		console.log('⚠️ Usuario requiere cambio de contraseña, redirigiendo...');
		goto('/cambiar-contrasena', { replaceState: true });
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	async function cargarPerfil() {
		if (!authService.getToken()) {
			fetchedProfile = true;
			return;
		}
		
		try {
			const res = await authService.me();
			setAuthUsuario(res.usuario);
			fetchedProfile = true;
		} catch (err) {
			console.error('Error cargando perfil:', err);
			
			// Si falla la carga del perfil (token inválido/expirado), limpiar la sesión
			authService.logout();
			auth.update((state) => ({
				...state,
				token: null,
				usuario: null,
				nombre_rol: null,
				isAuthenticated: false,
			}));
			
			fetchedProfile = true;
			// El hooks.server.js se encargará de la redirección en el próximo request
		}
	}
</script>

<svelte:window />

{#if mostrarSinNavegacion}
	<!-- Layout para páginas públicas y cambio de contraseña obligatorio - sin navbar ni sidebar -->
	<div class="login-wrapper">
		<slot />
		<Notificaciones />
	</div>
{:else if $auth.loggingOut}
	<!-- Pantalla de cierre de sesión -->
	<div class="layout">
		<main class="content full-width">
			<div style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
				<div style="text-align: center;">
					<div class="spinner" style="margin: 0 auto 16px;"></div>
					<p>Cerrando sesión...</p>
				</div>
			</div>
		</main>
	</div>
{:else}
	<!-- Layout normal con navbar y sidebar -->
	<div class="layout">
		<Navbar on:toggle={toggleSidebar} />

		<div class="main-container">
			{#if !mounted}
				<!-- Esperando inicialización -->
				<main class="content full-width">
					<div style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
						<div style="text-align: center;">
							<div class="spinner" style="margin: 0 auto 16px;"></div>
							<p>Inicializando...</p>
						</div>
					</div>
				</main>
			{:else if isAuthed && perfilCargado}
				<Sidebar open={sidebarOpen} />
				<main class="content">
					<slot />
				</main>
			{:else if isAuthed && !perfilCargado}
				<!-- Mostrar un loading mientras se carga el perfil -->
				<main class="content full-width">
					<div style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
						<div style="text-align: center;">
							<div class="spinner" style="margin: 0 auto 16px;"></div>
							<p>Cargando perfil...</p>
						</div>
					</div>
				</main>
			{:else}
				<!-- No autenticado, mostrará login o redirigirá -->
				<main class="content full-width">
					<slot />
				</main>
			{/if}
		</div>

		<Notificaciones />
	</div>
{/if}

<style>
	.login-wrapper {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.layout {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.main-container {
		display: flex;
		flex: 1;
		overflow: hidden;
		width: 100%;
	}

	.content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 20px;
		width: 100%;
		background-color: #f5f5f5;
	}

	.content.full-width {
		width: 100%;
	}

	/* Asegurar que el sidebar no cause problemas */
	:global(.sidebar) {
		flex-shrink: 0;
	}
</style>
