import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
  // Si no hay token en locals (inyectado por hooks.server.js), redirigir a login
  if (!locals.token) {
    throw redirect(303, '/login');
  }

  // El usuario está autenticado, permitir acceso
  return {
    isAuthenticated: true,
  };
}
