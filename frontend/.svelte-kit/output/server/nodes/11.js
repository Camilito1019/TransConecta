import * as server from '../entries/pages/_page.server.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/11.CuWCfCET.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/2J32lFCu.js","_app/immutable/chunks/DdWuALZu.js","_app/immutable/chunks/D5sqcERo.js","_app/immutable/chunks/DPz5OIRn.js","_app/immutable/chunks/DNIL3y1X.js","_app/immutable/chunks/qLEJnVdX.js","_app/immutable/chunks/CgsUcASs.js","_app/immutable/chunks/DjPkcCDc.js","_app/immutable/chunks/D4-J_OgU.js","_app/immutable/chunks/-w5iKcy_.js","_app/immutable/chunks/B3jtdlFh.js","_app/immutable/chunks/C07Td5iz.js","_app/immutable/chunks/3qLZv7Rd.js","_app/immutable/chunks/y7-MpCW8.js"];
export const stylesheets = ["_app/immutable/assets/11.0SJu-ESo.css"];
export const fonts = [];
