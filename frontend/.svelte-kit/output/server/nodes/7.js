import * as server from '../entries/pages/roles/_layout.server.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/roles/+layout.server.js";
export const imports = ["_app/immutable/nodes/7.dTUWbVVi.js","_app/immutable/chunks/6tqRmlGT.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DdWuALZu.js","_app/immutable/chunks/DPz5OIRn.js"];
export const stylesheets = [];
export const fonts = [];
