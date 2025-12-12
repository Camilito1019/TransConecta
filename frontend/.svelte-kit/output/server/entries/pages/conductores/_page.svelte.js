import { s as store_get, h as head, e as ensure_array_like, b as attr_class, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { e as conductores } from "../../../chunks/stores.js";
import { a as puedeCrear, b as puedeEditar, c as puedeEliminar, d as puedeCambiarEstado, m as modulosConfig } from "../../../chunks/permisos.js";
import { e as estadoClass, a as estadoLabel } from "../../../chunks/status.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stats;
    const MODULO = "conductores";
    let puedeCrearConductores = false;
    let puedeEditarConductores = false;
    let puedeEliminarConductores = false;
    let puedeCambiarEstadoConductores = false;
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      puedeCrearConductores = puedeCrear(MODULO);
      puedeEditarConductores = puedeEditar(MODULO);
      puedeEliminarConductores = puedeEliminar(MODULO);
      puedeCambiarEstadoConductores = puedeCambiarEstado(MODULO);
    }
    stats = {
      total: store_get($$store_subs ??= {}, "$conductores", conductores).items.length,
      activos: store_get($$store_subs ??= {}, "$conductores", conductores).items.filter((c) => c.estado === "activo").length,
      inactivos: store_get($$store_subs ??= {}, "$conductores", conductores).items.filter((c) => c.estado === "inactivo").length
    };
    head("dngsxy", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Gestión de Conductores - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-dngsxy"><div class="bg-shape shape-a svelte-dngsxy" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-dngsxy" aria-hidden="true"></div> <section class="hero svelte-dngsxy"><div class="hero-text svelte-dngsxy"><p class="eyebrow svelte-dngsxy">Operaciones</p> <h1 class="svelte-dngsxy">Gestión de Conductores</h1> <p class="lede svelte-dngsxy">Administra conductores, licencias y estado operativo.</p> <div class="chips svelte-dngsxy"><span class="chip success svelte-dngsxy">${escape_html(stats.activos)} activos</span> <span class="chip muted svelte-dngsxy">${escape_html(stats.inactivos)} inactivos</span></div></div> <div class="hero-actions svelte-dngsxy">`);
    if (puedeCrearConductores) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary svelte-dngsxy">+ Nuevo conductor</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="panel svelte-dngsxy"><div class="panel-head svelte-dngsxy"><div><p class="label svelte-dngsxy">Listado</p> <h2 class="svelte-dngsxy">Conductores</h2></div></div> `);
    if (store_get($$store_subs ??= {}, "$conductores", conductores).loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-dngsxy"><div class="spinner svelte-dngsxy"></div> <p>Cargando conductores...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$conductores", conductores).items.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-dngsxy"><p>No hay conductores registrados.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="table-wrap svelte-dngsxy"><table class="svelte-dngsxy"><thead class="svelte-dngsxy"><tr class="svelte-dngsxy"><th class="svelte-dngsxy">Nombre</th><th class="svelte-dngsxy">Cédula</th><th class="svelte-dngsxy">Teléfono</th><th class="svelte-dngsxy">Licencia</th><th class="svelte-dngsxy">Estado</th><th class="svelte-dngsxy"></th></tr></thead><tbody class="svelte-dngsxy"><!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$conductores", conductores).items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let c = each_array[$$index];
          $$renderer2.push(`<tr class="svelte-dngsxy"><td class="svelte-dngsxy">${escape_html(c.nombre)}</td><td class="svelte-dngsxy">${escape_html(c.cedula)}</td><td class="svelte-dngsxy">${escape_html(c.telefono || "—")}</td><td class="svelte-dngsxy">${escape_html(c.licencia_conduccion || "—")}</td><td class="svelte-dngsxy"><span${attr_class(`status-pill status-${estadoClass(c.estado)}`, "svelte-dngsxy")}>${escape_html(estadoLabel(c.estado))}</span></td><td class="actions svelte-dngsxy"><button class="ghost svelte-dngsxy">Ver</button> `);
          if (puedeEditarConductores) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="ghost svelte-dngsxy">Editar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeCambiarEstadoConductores) {
            $$renderer2.push("<!--[-->");
            if (c.estado === "inactivo") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<button class="success svelte-dngsxy">Activar</button>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<button class="danger svelte-dngsxy">Desactivar</button>`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeEliminarConductores) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="outline svelte-dngsxy">Eliminar</button>`);
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
    $$renderer2.push(`<!--]--> `);
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
