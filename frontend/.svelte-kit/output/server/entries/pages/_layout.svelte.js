import { s as store_get, a as attr, u as unsubscribe_stores, e as ensure_array_like, b as attr_class, c as slot, d as bind_props } from "../../chunks/index2.js";
import { a as auth, n as notificaciones, b as authService } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { p as puedeAccion } from "../../chunks/permisos.js";
import { V as escape_html, W as getContext } from "../../chunks/context.js";
import "clsx";
/* empty css               */
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let userMenuOpen = false;
    $$renderer2.push(`<nav class="navbar svelte-d8j1hi"><div class="navbar-container svelte-d8j1hi"><div class="left svelte-d8j1hi"><button class="icon-btn svelte-d8j1hi" aria-label="Abrir menú"><span class="ms-icon">menu</span></button> `);
    if (!puedeAccion("dashboard", "ver")) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="brand brand-disabled svelte-d8j1hi"><div class="brand-mark svelte-d8j1hi">TC</div> <div class="brand-text svelte-d8j1hi"><span class="brand-eyebrow svelte-d8j1hi">Panel</span> <span class="brand-name svelte-d8j1hi">TransConecta</span></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button class="brand svelte-d8j1hi"><div class="brand-mark svelte-d8j1hi">TC</div> <div class="brand-text svelte-d8j1hi"><span class="brand-eyebrow svelte-d8j1hi">Panel</span> <span class="brand-name svelte-d8j1hi">TransConecta</span></div></button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (store_get($$store_subs ??= {}, "$auth", auth).isAuthenticated) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="right svelte-d8j1hi"><button class="icon-btn svelte-d8j1hi"${attr("aria-label", "Cambiar a modo oscuro")}${attr("title", "Modo oscuro")}><span class="ms-icon">${escape_html("dark_mode")}</span></button> <button class="user-pill svelte-d8j1hi" aria-haspopup="true"${attr("aria-expanded", userMenuOpen)}><span class="dot svelte-d8j1hi"></span> <div class="user-meta svelte-d8j1hi"><span class="user-name svelte-d8j1hi">${escape_html(store_get($$store_subs ??= {}, "$auth", auth).usuario?.nombre_usuario || "Usuario")}</span> <span class="user-role svelte-d8j1hi">${escape_html(store_get($$store_subs ??= {}, "$auth", auth).nombre_rol || store_get($$store_subs ??= {}, "$auth", auth).usuario?.nombre_rol || "Rol")}</span></div> <span class="ms-icon caret svelte-d8j1hi">${escape_html("expand_more")}</span></button> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Notificaciones($$renderer) {
  var $$store_subs;
  $$renderer.push(`<div class="notificaciones-container svelte-90e3ac"><!--[-->`);
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$notificaciones", notificaciones));
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let notificacion = each_array[$$index];
    $$renderer.push(`<div${attr_class(`notificacion notificacion-${notificacion.tipo}`, "svelte-90e3ac")}><div class="dot svelte-90e3ac"></div> <span>${escape_html(notificacion.mensaje)}</span></div>`);
  }
  $$renderer.push(`<!--]--></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isLoginPage, isRecuperarPage, isCambiarContrasenaPage, requiereCambioContrasena, isPublicPage, mostrarSinNavegacion;
    let data = $$props["data"];
    let fetchedProfile = false;
    let previousAuthState = false;
    if (typeof window !== "undefined") {
      const fromLocalStorage = localStorage.getItem("auth_token");
      const fromCookie = document.cookie.split("; ").find((row) => row.startsWith("auth_token="))?.split("=")[1];
      const token = fromLocalStorage || fromCookie;
      if (token) {
        localStorage.setItem("auth_token", token);
        authService.setToken(token);
        auth.update((state) => ({ ...state, token, isAuthenticated: true }));
      }
    }
    if (data?.token) {
      auth.update((state) => ({ ...state, token: data.token, isAuthenticated: true }));
    }
    Boolean(data?.token);
    isLoginPage = store_get($$store_subs ??= {}, "$page", page).route.id === "/login";
    isRecuperarPage = store_get($$store_subs ??= {}, "$page", page).route.id === "/recuperar-contrasena";
    isCambiarContrasenaPage = store_get($$store_subs ??= {}, "$page", page).route.id === "/cambiar-contrasena";
    requiereCambioContrasena = store_get($$store_subs ??= {}, "$auth", auth)?.usuario?.requiere_cambio_contrasena === true;
    isPublicPage = isLoginPage || isRecuperarPage;
    mostrarSinNavegacion = isPublicPage || isCambiarContrasenaPage && requiereCambioContrasena;
    if (store_get($$store_subs ??= {}, "$auth", auth).isAuthenticated !== previousAuthState) {
      previousAuthState = store_get($$store_subs ??= {}, "$auth", auth).isAuthenticated;
      if (store_get($$store_subs ??= {}, "$auth", auth).isAuthenticated) {
        fetchedProfile = false;
      } else {
        fetchedProfile = true;
      }
    }
    fetchedProfile && (store_get($$store_subs ??= {}, "$auth", auth).usuario !== null || !store_get($$store_subs ??= {}, "$auth", auth).isAuthenticated);
    if (
      // Si falla la carga del perfil (token inválido/expirado), limpiar la sesión
      // El hooks.server.js se encargará de la redirección en el próximo request
      mostrarSinNavegacion
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="login-wrapper svelte-12qhfyh"><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]--> `);
      Notificaciones($$renderer2);
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$auth", auth).loggingOut) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="layout svelte-12qhfyh"><main class="content full-width svelte-12qhfyh"><div style="display: flex; justify-content: center; align-items: center; min-height: 60vh;"><div style="text-align: center;"><div class="spinner" style="margin: 0 auto 16px;"></div> <p>Cerrando sesión...</p></div></div></main></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="layout svelte-12qhfyh">`);
        Navbar($$renderer2);
        $$renderer2.push(`<!----> <div class="main-container svelte-12qhfyh">`);
        {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<main class="content full-width svelte-12qhfyh"><div style="display: flex; justify-content: center; align-items: center; min-height: 60vh;"><div style="text-align: center;"><div class="spinner" style="margin: 0 auto 16px;"></div> <p>Inicializando...</p></div></div></main>`);
        }
        $$renderer2.push(`<!--]--></div> `);
        Notificaciones($$renderer2);
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
export {
  _layout as default
};
