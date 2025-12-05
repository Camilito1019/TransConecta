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

	onMount(() => {
		// Sincroniza el estado de autenticación desde localStorage o cookie
		const fromLocalStorage = localStorage.getItem('auth_token');
		const fromCookie = document.cookie
			.split('; ')
			.find((row) => row.startsWith('auth_token='))
			?.split('=')[1];

		const token = fromLocalStorage || fromCookie || data?.token;
		if (token) {
			localStorage.setItem('auth_token', token);
			authService.setToken(token);
			auth.update((state) => ({
				...state,
				token,
				isAuthenticated: true,
			}));

			// Cargar perfil si aún no se tiene
			if (!fetchedProfile) {
				void cargarPerfil();
			}
		}
		mounted = true;
	});

	// Hidrata el store antes de montar si el token viene del load SSR
	if (data?.token) {
		auth.update((state) => ({ ...state, token: data.token, isAuthenticated: true }));
	}

	$: isAuthed = mounted ? $auth.isAuthenticated : Boolean(data?.token);
	$: isLoginPage = $page.route.id === '/login';
	$: shouldRedirectToLogin = mounted && !isAuthed && !isLoginPage;
	$: if (shouldRedirectToLogin) {
		goto('/login');
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	async function cargarPerfil() {
		if (!authService.getToken()) return;
		try {
			const res = await authService.me();
			setAuthUsuario(res.usuario);
		} catch (err) {
			addNotificacion(err.message || 'No se pudo cargar el perfil', 'error');
		} finally {
			fetchedProfile = true;
		}
	}
</script>

<svelte:window />

{#if isLoginPage}
	<!-- Layout para página de login - sin navbar ni sidebar -->
	<div class="login-wrapper">
		<slot />
		<Notificaciones />
	</div>
{:else}
	<!-- Layout normal con navbar y sidebar -->
	<div class="layout">
		<Navbar on:toggle={toggleSidebar} />

		<div class="main-container">
			{#if isAuthed}
				<Sidebar open={sidebarOpen} />
				<main class="content">
					<slot />
				</main>
			{:else}
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
