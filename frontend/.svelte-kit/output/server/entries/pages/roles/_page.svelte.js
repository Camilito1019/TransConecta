import { s as store_get, h as head, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { r as roles } from "../../../chunks/stores.js";
import { p as puedeAccion, m as modulosConfig } from "../../../chunks/permisos.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stats;
    const MODULO = "roles";
    let permiteCrearRol = false;
    let permiteEditarRol = false;
    let permiteEliminarRol = false;
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      permiteCrearRol = puedeAccion(MODULO, "crear");
      permiteEditarRol = puedeAccion(MODULO, "editar");
      permiteEliminarRol = puedeAccion(MODULO, "eliminar");
    }
    stats = {
      total: store_get($$store_subs ??= {}, "$roles", roles).items.length
    };
    head("1gunji", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Gestión de Roles - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-1gunji"><div class="bg-shape shape-a svelte-1gunji" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-1gunji" aria-hidden="true"></div> <section class="hero svelte-1gunji"><div class="hero-text svelte-1gunji"><p class="eyebrow svelte-1gunji">Permisos</p> <h1 class="svelte-1gunji">Gestión de Roles</h1> <p class="lede svelte-1gunji">Define las responsabilidades y alcance de tu equipo.</p> <div class="chips svelte-1gunji"><span class="chip success svelte-1gunji">${escape_html(stats.total)} roles</span></div></div> <div class="hero-actions svelte-1gunji">`);
    if (permiteCrearRol) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary svelte-1gunji">+ Nuevo rol</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="panel svelte-1gunji"><div class="panel-head svelte-1gunji"><div><p class="label svelte-1gunji">Listado</p> <h2 class="svelte-1gunji">Roles</h2></div></div> `);
    if (store_get($$store_subs ??= {}, "$roles", roles).loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-1gunji"><div class="spinner svelte-1gunji"></div> <p>Cargando roles...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$roles", roles).items.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-1gunji"><p>No hay roles registrados.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="table-wrap svelte-1gunji"><table class="svelte-1gunji"><thead class="svelte-1gunji"><tr class="svelte-1gunji"><th class="svelte-1gunji">Nombre</th><th class="svelte-1gunji">Descripción</th><th class="svelte-1gunji"></th></tr></thead><tbody class="svelte-1gunji"><!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$roles", roles).items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let rol = each_array[$$index];
          $$renderer2.push(`<tr class="svelte-1gunji"><td class="svelte-1gunji">${escape_html(rol.nombre_rol)}</td><td class="svelte-1gunji">${escape_html(rol.descripcion || "—")}</td><td class="actions svelte-1gunji">`);
          if (permiteEditarRol) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="ghost svelte-1gunji">Editar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (permiteEliminarRol) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="danger svelte-1gunji">Eliminar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
