import { s as store_get, h as head, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { t as trayectos } from "../../../chunks/stores.js";
import { a as puedeCrear, b as puedeEditar, c as puedeEliminar, m as modulosConfig } from "../../../chunks/permisos.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stats;
    const MODULO = "trayectos";
    let puedeCrearTrayectos = false;
    let puedeEditarTrayectos = false;
    let puedeEliminarTrayectos = false;
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      puedeCrearTrayectos = puedeCrear(MODULO);
      puedeEditarTrayectos = puedeEditar(MODULO);
      puedeEliminarTrayectos = puedeEliminar(MODULO);
    }
    stats = {
      total: store_get($$store_subs ??= {}, "$trayectos", trayectos).items.length,
      distanciaTotal: store_get($$store_subs ??= {}, "$trayectos", trayectos).items.reduce((acc, t) => acc + Number(t.distancia_km || 0), 0)
    };
    head("s46ggx", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Gestión de Trayectos - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-s46ggx"><div class="bg-shape shape-a svelte-s46ggx" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-s46ggx" aria-hidden="true"></div> <section class="hero svelte-s46ggx"><div class="hero-text svelte-s46ggx"><p class="eyebrow svelte-s46ggx">Rutas</p> <h1 class="svelte-s46ggx">Gestión de Trayectos</h1> <p class="lede svelte-s46ggx">Define rutas con origen, destino, distancia y tiempo estimado.</p> <div class="chips svelte-s46ggx"><span class="chip success svelte-s46ggx">${escape_html(stats.total)} trayectos</span> <span class="chip muted svelte-s46ggx">${escape_html(stats.distanciaTotal.toFixed(1))} km totales</span></div></div> <div class="hero-actions svelte-s46ggx">`);
    if (puedeCrearTrayectos) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary svelte-s46ggx">+ Nuevo trayecto</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="panel svelte-s46ggx"><div class="panel-head svelte-s46ggx"><div><p class="label svelte-s46ggx">Listado</p> <h2 class="svelte-s46ggx">Trayectos</h2></div></div> `);
    if (store_get($$store_subs ??= {}, "$trayectos", trayectos).loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-s46ggx"><div class="spinner svelte-s46ggx"></div> <p>Cargando trayectos...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$trayectos", trayectos).items.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-s46ggx"><p>No hay trayectos registrados.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="table-wrap svelte-s46ggx"><table class="svelte-s46ggx"><thead class="svelte-s46ggx"><tr class="svelte-s46ggx"><th class="svelte-s46ggx">Origen</th><th class="svelte-s46ggx">Destino</th><th class="svelte-s46ggx">Distancia</th><th class="svelte-s46ggx">Tiempo</th><th class="svelte-s46ggx"></th></tr></thead><tbody class="svelte-s46ggx"><!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$trayectos", trayectos).items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let r = each_array[$$index];
          $$renderer2.push(`<tr class="svelte-s46ggx"><td class="svelte-s46ggx">${escape_html(r.origen)}</td><td class="svelte-s46ggx">${escape_html(r.destino)}</td><td class="svelte-s46ggx">${escape_html(r.distancia_km)} km</td><td class="svelte-s46ggx">${escape_html(r.tiempo_estimado)} h</td><td class="actions svelte-s46ggx">`);
          if (puedeEditarTrayectos) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="ghost svelte-s46ggx">Editar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeEliminarTrayectos) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="outline svelte-s46ggx">Eliminar</button>`);
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
