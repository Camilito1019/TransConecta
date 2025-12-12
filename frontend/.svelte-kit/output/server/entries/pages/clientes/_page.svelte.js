import { s as store_get, h as head, e as ensure_array_like, b as attr_class, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { d as clientes } from "../../../chunks/stores.js";
import { a as puedeCrear, b as puedeEditar, c as puedeEliminar, d as puedeCambiarEstado, m as modulosConfig } from "../../../chunks/permisos.js";
import { e as estadoClass, a as estadoLabel } from "../../../chunks/status.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stats;
    const MODULO = "clientes";
    let puedeCrearClientes = false;
    let puedeEditarClientes = false;
    let puedeEliminarClientes = false;
    let puedeCambiarEstadoClientes = false;
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      puedeCrearClientes = puedeCrear(MODULO);
      puedeEditarClientes = puedeEditar(MODULO);
      puedeEliminarClientes = puedeEliminar(MODULO);
      puedeCambiarEstadoClientes = puedeCambiarEstado(MODULO);
    }
    stats = {
      total: store_get($$store_subs ??= {}, "$clientes", clientes).items.length,
      activos: store_get($$store_subs ??= {}, "$clientes", clientes).items.filter((c) => c.estado === "activo").length,
      inactivos: store_get($$store_subs ??= {}, "$clientes", clientes).items.filter((c) => c.estado === "inactivo").length
    };
    head("1uf6cn0", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Gestión de Clientes - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-1uf6cn0"><div class="bg-shape shape-a svelte-1uf6cn0" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-1uf6cn0" aria-hidden="true"></div> <section class="hero svelte-1uf6cn0"><div class="hero-text svelte-1uf6cn0"><p class="eyebrow svelte-1uf6cn0">Gestión</p> <h1 class="svelte-1uf6cn0">Clientes</h1> <p class="lede svelte-1uf6cn0">Administra los clientes asociados a los trayectos.</p> <div class="chips svelte-1uf6cn0"><span class="chip success svelte-1uf6cn0">${escape_html(stats.activos)} activos</span> <span class="chip muted svelte-1uf6cn0">${escape_html(stats.inactivos)} inactivos</span></div></div> <div class="hero-actions svelte-1uf6cn0">`);
    if (puedeCrearClientes) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary svelte-1uf6cn0">+ Nuevo cliente</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="panel svelte-1uf6cn0"><div class="panel-head svelte-1uf6cn0"><div><p class="label svelte-1uf6cn0">Listado</p> <h2 class="svelte-1uf6cn0">Clientes</h2></div></div> `);
    if (store_get($$store_subs ??= {}, "$clientes", clientes).loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-1uf6cn0"><div class="spinner svelte-1uf6cn0"></div> <p>Cargando clientes...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$clientes", clientes).items.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-1uf6cn0"><p>No hay clientes registrados.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="table-wrap svelte-1uf6cn0"><table class="svelte-1uf6cn0"><thead class="svelte-1uf6cn0"><tr class="svelte-1uf6cn0"><th class="svelte-1uf6cn0">Nombre</th><th class="svelte-1uf6cn0">Teléfono</th><th class="svelte-1uf6cn0">Estado</th><th class="svelte-1uf6cn0"></th></tr></thead><tbody class="svelte-1uf6cn0"><!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$clientes", clientes).items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let c = each_array[$$index];
          $$renderer2.push(`<tr class="svelte-1uf6cn0"><td class="svelte-1uf6cn0">${escape_html(c.nombre)}</td><td class="svelte-1uf6cn0">${escape_html(c.telefono || "—")}</td><td class="svelte-1uf6cn0"><span${attr_class(`status-pill status-${estadoClass(c.estado)}`, "svelte-1uf6cn0")}>${escape_html(estadoLabel(c.estado))}</span></td><td class="actions svelte-1uf6cn0">`);
          if (puedeEditarClientes) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="ghost svelte-1uf6cn0">Editar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeCambiarEstadoClientes) {
            $$renderer2.push("<!--[-->");
            if (c.estado === "inactivo") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<button class="success svelte-1uf6cn0">Activar</button>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<button class="danger svelte-1uf6cn0">Desactivar</button>`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeEliminarClientes) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="outline svelte-1uf6cn0">Eliminar</button>`);
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
