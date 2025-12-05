
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/asignaciones" | "/conductores" | "/login" | "/roles" | "/trayectos" | "/usuarios" | "/vehiculos";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/asignaciones": Record<string, never>;
			"/conductores": Record<string, never>;
			"/login": Record<string, never>;
			"/roles": Record<string, never>;
			"/trayectos": Record<string, never>;
			"/usuarios": Record<string, never>;
			"/vehiculos": Record<string, never>
		};
		Pathname(): "/" | "/asignaciones" | "/asignaciones/" | "/conductores" | "/conductores/" | "/login" | "/login/" | "/roles" | "/roles/" | "/trayectos" | "/trayectos/" | "/usuarios" | "/usuarios/" | "/vehiculos" | "/vehiculos/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}