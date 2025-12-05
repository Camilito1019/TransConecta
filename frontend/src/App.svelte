<script>
  // App.svelte no debe manejar el enrutamiento en un proyecto SvelteKit
  // SvelteKit maneja automáticamente las rutas basadas en la estructura de carpetas en src/routes/
  // Este archivo simplemente proporciona el punto de entrada
</script>

<slot />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
      'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) {
    box-sizing: border-box;
  }
</style>
