import * as server from '../entries/pages/clientes/_layout.server.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/clientes/+layout.server.js";
export const imports = ["_app/immutable/nodes/4.dTUWbVVi.js","_app/immutable/chunks/6tqRmlGT.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DdWuALZu.js","_app/immutable/chunks/DPz5OIRn.js"];
export const stylesheets = [];
export const fonts = [];
