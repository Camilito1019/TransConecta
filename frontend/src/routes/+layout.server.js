import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
  const token = cookies.get('auth_token');

  // Si no hay token y no es la página de login, redirige a login (seguridad extra en SSR)
  if (!token && url.pathname !== '/login') {
    throw redirect(303, '/login');
  }

  return {
    token: token || null,
  };
}
