import { redirect } from "@sveltejs/kit";
async function load({ locals }) {
  if (locals.token) {
    throw redirect(303, "/");
  }
  return {
    isAuthenticated: false
  };
}
const actions = {
  // Acción para manejar el login desde el servidor
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const correo = data.get("correo");
    const contraseña = data.get("contraseña");
    if (!correo || !contraseña) {
      return { error: "Correo y contraseña son requeridos" };
    }
    try {
      const apiUrl = process.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña })
      });
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || "Error en el login" };
      }
      const result = await response.json();
      if (!result.token) {
        return { success: false, error: "No se recibió token del servidor" };
      }
      cookies.set("auth_token", result.token, {
        path: "/",
        httpOnly: false,
        // Permitir acceso desde JavaScript
        maxAge: 7200,
        // 2 horas
        sameSite: "lax",
        secure: false
        // Cambiar a true en producción con HTTPS
      });
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
          requiere_cambio_contrasena: result.requiere_cambio_contrasena || false
        },
        location: "/"
      };
    } catch (error) {
      if (error.status === 303) {
        throw error;
      }
      console.error("Login error:", error);
      return { error: error.message || "Error al conectar con el servidor" };
    }
  }
};
export {
  actions,
  load
};
