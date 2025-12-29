import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  // Si el usuario ya está autenticado, redirigir a la página principal
  if (locals.token) {
    throw redirect(303, '/');
  }

  return {
    isAuthenticated: false,
  };
}

export const actions = {
  // Acción para manejar el login desde el servidor
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const correo = data.get('correo');
    const contraseña = data.get('contraseña');

    if (!correo || !contraseña) {
      return { success: false, error: 'Correo y contraseña son requeridos' };
    }

    try {
      // SSR puede correr:
      // - Local (Windows): backend suele ser localhost
      // - Docker: backend suele resolverse como "backend"
      // Intentamos URLs en orden hasta que una responda.
      const candidates = [
        process.env.INTERNAL_API_URL,
        process.env.VITE_API_URL,
        'http://localhost:3000/api',
        'http://backend:3000/api',
      ].filter(Boolean);

      const uniqueCandidates = [...new Set(candidates)];

      let response;
      let lastNetworkError;

      for (const baseUrl of uniqueCandidates) {
        try {
          response = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contraseña }),
          });
          lastNetworkError = null;
          break;
        } catch (err) {
          lastNetworkError = err;
          continue;
        }
      }

      if (!response) {
        const message =
          lastNetworkError?.cause?.code === 'ENOTFOUND'
            ? `No se pudo resolver el host del backend (${lastNetworkError?.cause?.hostname}). Configura INTERNAL_API_URL o VITE_API_URL.`
            : lastNetworkError?.message || 'Error al conectar con el servidor';
        return { success: false, error: message };
      }

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Error en el login' };
      }

      const result = await response.json();

      if (!result.token) {
        return { success: false, error: 'No se recibió token del servidor' };
      }

      // Establecer la cookie de autenticación
      cookies.set('auth_token', result.token, {
        path: '/',
        httpOnly: false, // Permitir acceso desde JavaScript
        maxAge: 7200, // 2 horas
        sameSite: 'lax',
        secure: false, // Cambiar a true en producción con HTTPS
      });

      // Devolver success para que el cliente maneje la navegación y persista token
      return {
        success: true,
        token: result.token,
        usuario: {
          id_usuario: result.id_usuario,
          id_rol: result.id_rol,
          nombre_usuario: result.nombre_usuario,
          correo: result.correo,
          nombre_rol: result.nombre_rol || null,
          estado: result.estado,
          requiere_cambio_contrasena: result.requiere_cambio_contrasena || false,
        },
        location: '/',
      };
    } catch (error) {
      if (error.status === 303) {
        throw error; // Re-throw redirect
      }
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Error al conectar con el servidor' };
    }
  },
};
