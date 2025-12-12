import { redirect } from "@sveltejs/kit";
async function load({ cookies, url }) {
  const token = cookies.get("auth_token");
  const publicRoutes = ["/login", "/recuperar-contrasena"];
  const isPublicRoute = publicRoutes.includes(url.pathname);
  if (!token && !isPublicRoute) {
    throw redirect(303, "/login");
  }
  return {
    token: token || null
  };
}
export {
  load
};
