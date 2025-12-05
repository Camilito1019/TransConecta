import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.token) {
    throw redirect(303, '/login');
  }

  return {
    isAuthenticated: true,
  };
}
