import { g as building } from "./environment.js";
import { redirect } from "@sveltejs/kit";
async function handle({ event, resolve }) {
  const { url, locals } = event;
  const token = event.cookies.get("auth_token");
  const publicRoutes = ["/login", "/recuperar-contrasena"];
  if (!publicRoutes.includes(url.pathname) && !token && !building) {
    throw redirect(303, "/login");
  }
  locals.token = token;
  const response = await resolve(event);
  return response;
}
export {
  handle
};
