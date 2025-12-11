import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
  const token = cookies.get('auth_token');

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/recuperar-contrasena'];
  const isPublicRoute = publicRoutes.includes(url.pathname);

  // Si no hay token y no es una página pública, redirige a login
  if (!token && !isPublicRoute) {
    throw redirect(303, '/login');
  }

  return {
    token: token || null,
  };
}
