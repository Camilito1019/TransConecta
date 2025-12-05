<script>
	import '../../app.css';
</script>

<div class="login-layout">
	<slot />
</div>

<style>
	:global(#svelte-kit-app) {
		width: 100%;
		height: 100%;
	}

	.login-layout {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
