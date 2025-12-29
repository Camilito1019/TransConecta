import sveltePreprocess from 'svelte-preprocess';

const config = {
  preprocess: sveltePreprocess(),
  
  kit: {
    // Configuración del adaptador para el despliegue
    adapter: {
      name: '@sveltejs/adapter-static',
      // Opciones adicionales del adaptador
      pages: 'build',
      assets: 'build',
      fallback: null
    },
    // Otras configuraciones de kit
    alias: {
      $lib: 'src/lib',
      $routes: 'src/routes'
    }
  }
};

export default config;