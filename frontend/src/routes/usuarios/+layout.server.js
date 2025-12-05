import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  // Proteger todas las rutas bajo este layout que requieren autenticación
  if (!locals.token) {
    throw redirect(303, '/login');
  }

  return {
    isAuthenticated: true,
  };
}
