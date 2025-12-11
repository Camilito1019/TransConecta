import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
  // Proteger rutas que requieren autenticación
  const { url, locals } = event;
  const token = event.cookies.get('auth_token');

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/recuperar-contrasena'];

  // Si la ruta no es pública y no hay token, redirigir a login
  if (!publicRoutes.includes(url.pathname) && !token && !building) {
    throw redirect(303, '/login');
  }

  // Pasar el token a través de locals para que esté disponible en endpoints
  locals.token = token;

  const response = await resolve(event);
  return response;
}
