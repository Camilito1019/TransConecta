import { redirect } from "@sveltejs/kit";
async function load({ locals }) {
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
