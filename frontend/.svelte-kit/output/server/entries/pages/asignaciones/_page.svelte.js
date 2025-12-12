import { s as store_get, h as head, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { c as asignaciones } from "../../../chunks/stores.js";
import { a as puedeCrear, b as puedeEditar, c as puedeEliminar, m as modulosConfig } from "../../../chunks/permisos.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stats;
    const MODULO = "asignaciones";
    let puedeCrearAsignaciones = false;
    let puedeEditarAsignaciones = false;
    let puedeEliminarAsignaciones = false;
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      puedeCrearAsignaciones = puedeCrear(MODULO);
      puedeEditarAsignaciones = puedeEditar(MODULO);
      puedeEliminarAsignaciones = puedeEliminar(MODULO);
    }
    stats = {
      total: store_get($$store_subs ??= {}, "$asignaciones", asignaciones).items.length,
      vehiculos: new Set(store_get($$store_subs ??= {}, "$asignaciones", asignaciones).items.map((a) => a.id_vehiculo)).size
    };
    head("7aymhh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Gestión de Asignaciones - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-7aymhh"><div class="bg-shape shape-a svelte-7aymhh" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-7aymhh" aria-hidden="true"></div> <section class="hero svelte-7aymhh"><div class="hero-text svelte-7aymhh"><p class="eyebrow svelte-7aymhh">Operaciones</p> <h1 class="svelte-7aymhh">Gestión de Asignaciones</h1> <p class="lede svelte-7aymhh">Coordina rutas, vehículos y conductores con control visual.</p> <div class="chips svelte-7aymhh"><span class="chip success svelte-7aymhh">${escape_html(stats.total)} asignaciones</span> <span class="chip muted svelte-7aymhh">${escape_html(stats.vehiculos)} vehículos</span></div></div> <div class="hero-actions svelte-7aymhh">`);
    if (puedeCrearAsignaciones || puedeEditarAsignaciones) {
      $$renderer2.push("<!--[-->");
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (puedeCrearAsignaciones) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="primary svelte-7aymhh">${escape_html("+ Nueva asignación")}</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="panel svelte-7aymhh"><div class="panel-head svelte-7aymhh"><div><p class="label svelte-7aymhh">Listado</p> <h2 class="svelte-7aymhh">Asignaciones</h2></div></div> `);
    if (store_get($$store_subs ??= {}, "$asignaciones", asignaciones).loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-7aymhh"><div class="spinner svelte-7aymhh"></div> <p>Cargando asignaciones...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$asignaciones", asignaciones).items.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-7aymhh"><p>No hay asignaciones registradas.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="table-wrap svelte-7aymhh"><table class="svelte-7aymhh"><thead class="svelte-7aymhh"><tr class="svelte-7aymhh"><th class="svelte-7aymhh">Vehículo</th><th class="svelte-7aymhh">Conductor</th><th class="svelte-7aymhh">Cliente</th><th class="svelte-7aymhh">Trayecto</th><th class="svelte-7aymhh">Fecha</th><th class="svelte-7aymhh"></th></tr></thead><tbody class="svelte-7aymhh"><!--[-->`);
        const each_array_4 = ensure_array_like(store_get($$store_subs ??= {}, "$asignaciones", asignaciones).items);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let a = each_array_4[$$index_4];
          $$renderer2.push(`<tr class="svelte-7aymhh"><td class="svelte-7aymhh">${escape_html(a.vehiculo_placa || "—")} · ${escape_html(a.vehiculo_marca || "")} ${escape_html(a.vehiculo_modelo || "")}</td><td class="svelte-7aymhh">${escape_html(a.conductor_nombre || "—")} (${escape_html(a.conductor_cedula || "—")})</td><td class="svelte-7aymhh">${escape_html(a.cliente_nombre || "—")}</td><td class="svelte-7aymhh">${escape_html(a.trayecto_origen || "—")} → ${escape_html(a.trayecto_destino || "—")}</td><td class="svelte-7aymhh">${escape_html(a.fecha_asignacion ? a.fecha_asignacion.substring(0, 10) : "—")}</td><td class="actions svelte-7aymhh">`);
          if (puedeEditarAsignaciones) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="outline svelte-7aymhh">Editar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeEliminarAsignaciones) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="danger svelte-7aymhh">Desasignar</button>`);
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
