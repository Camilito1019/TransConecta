<script>
	import Navbar from '$components/Navbar.svelte';
	import Sidebar from '$components/Sidebar.svelte';
	import Notificaciones from '$components/Notificaciones.svelte';
	import { auth } from '$lib/stores.js';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.css';

	let sidebarOpen = false;
	let mounted = false;

	onMount(() => {
		// Cuando monta el cliente, sincroniza el estado de autenticación
		const token = localStorage.getItem('auth_token');
		if (token) {
			auth.update((state) => ({
				...state,
				token,
				isAuthenticated: true,
			}));
		}
		mounted = true;
	});

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	// Determinar si estamos en la página de login
	$: isLoginPage = $page.route.id === '/login';
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
			{#if mounted && $auth.isAuthenticated}
				<Sidebar open={sidebarOpen} />
				<main class="content">
					<slot />
				</main>
			{:else if mounted}
				<main class="content full-width">
					<slot />
				</main>
			{:else}
				<!-- Placeholder mientras monta -->
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
