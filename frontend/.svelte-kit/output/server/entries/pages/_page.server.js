import { redirect } from "@sveltejs/kit";
async function load({ locals, url }) {
  if (!locals.token) {
    throw redirect(303, "/login");
  }
  return {
    isAuthenticated: true
  };
}
export {
  load
};
