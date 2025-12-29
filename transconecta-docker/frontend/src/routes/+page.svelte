<script lang="ts">
  import { onMount } from 'svelte';

  let message: string;

  onMount(() => {
    message = "Bienvenido a TransConecta!";
  });
</script>

<main>
  <h1>{message}</h1>
  <p>Esta es la página principal de la aplicación.</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 600px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
  }

  p {
    font-size: 1.2em;
  }
</style>