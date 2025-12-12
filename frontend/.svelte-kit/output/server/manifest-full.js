export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.E5sPrs5G.js",app:"_app/immutable/entry/app.DnriOuuU.js",imports:["_app/immutable/entry/start.E5sPrs5G.js","_app/immutable/chunks/C07Td5iz.js","_app/immutable/chunks/D5sqcERo.js","_app/immutable/chunks/DdWuALZu.js","_app/immutable/chunks/DPz5OIRn.js","_app/immutable/entry/app.DnriOuuU.js","_app/immutable/chunks/DdWuALZu.js","_app/immutable/chunks/D5sqcERo.js","_app/immutable/chunks/DPz5OIRn.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DNIL3y1X.js","_app/immutable/chunks/_X9-3qsY.js","_app/immutable/chunks/B3jtdlFh.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js')),
			__memo(() => import('./nodes/23.js')),
			__memo(() => import('./nodes/24.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/asignaciones",
				pattern: /^\/asignaciones\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/cambiar-contrasena",
				pattern: /^\/cambiar-contrasena\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/clientes",
				pattern: /^\/clientes\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/conductores",
				pattern: /^\/conductores\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,6,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/modulos",
				pattern: /^\/modulos\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/operaciones/horas",
				pattern: /^\/operaciones\/horas\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/perfil",
				pattern: /^\/perfil\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/recuperar-contrasena",
				pattern: /^\/recuperar-contrasena\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/roles",
				pattern: /^\/roles\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/trayectos",
				pattern: /^\/trayectos\/?$/,
				params: [],
				page: { layouts: [0,8,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/usuarios",
				pattern: /^\/usuarios\/?$/,
				params: [],
				page: { layouts: [0,9,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/vehiculos",
				pattern: /^\/vehiculos\/?$/,
				params: [],
				page: { layouts: [0,10,], errors: [1,,], leaf: 24 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
