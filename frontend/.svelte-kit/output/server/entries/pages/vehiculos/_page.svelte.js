import { s as store_get, h as head, e as ensure_array_like, b as attr_class, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { v as vehiculos } from "../../../chunks/stores.js";
import { e as estadoClass, a as estadoLabel } from "../../../chunks/status.js";
import { a as puedeCrear, b as puedeEditar, c as puedeEliminar, d as puedeCambiarEstado, m as modulosConfig } from "../../../chunks/permisos.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stats;
    const MODULO = "vehiculos";
    let puedeCrearVehiculos = false;
    let puedeEditarVehiculos = false;
    let puedeEliminarVehiculos = false;
    let puedeCambiarEstadoVehiculos = false;
    const etiquetasDocumento = {
      soat: "SOAT",
      tecnicomecanica: "TECNICOMECANICA",
      tarjeta_propiedad: "TARJETA_PROPIEDAD",
      foto_placa: "FOTO_PLACA",
      foto_exterior: "FOTO_EXTERIOR",
      foto_interior: "FOTO_INTERIOR"
    };
    Object.fromEntries(Object.entries(etiquetasDocumento).map(([k, v]) => [v, k]));
    const docFields = [
      { key: "soat", label: "SOAT", accept: "application/pdf" },
      {
        key: "tecnicomecanica",
        label: "Tecnicomecánica",
        accept: "application/pdf"
      },
      {
        key: "tarjeta_propiedad",
        label: "Tarjeta de propiedad",
        accept: "application/pdf"
      },
      {
        key: "foto_placa",
        label: "Foto placa",
        accept: "image/png,image/jpeg,image/jpg"
      },
      {
        key: "foto_exterior",
        label: "Foto exterior",
        accept: "image/png,image/jpeg,image/jpg"
      },
      {
        key: "foto_interior",
        label: "Foto interior",
        accept: "image/png,image/jpeg,image/jpg"
      }
    ];
    Object.fromEntries(docFields.map((d) => [d.key, d.accept.split(",")]));
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      puedeCrearVehiculos = puedeCrear(MODULO);
      puedeEditarVehiculos = puedeEditar(MODULO);
      puedeEliminarVehiculos = puedeEliminar(MODULO);
      puedeCambiarEstadoVehiculos = puedeCambiarEstado(MODULO);
    }
    stats = {
      total: store_get($$store_subs ??= {}, "$vehiculos", vehiculos).items.length,
      operativos: store_get($$store_subs ??= {}, "$vehiculos", vehiculos).items.filter((v) => v.estado_operativo === "operativo").length,
      inactivos: store_get($$store_subs ??= {}, "$vehiculos", vehiculos).items.filter((v) => v.estado_operativo === "inactivo").length
    };
    head("1jwxbu7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Gestión de Vehículos - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-1jwxbu7"><div class="bg-shape shape-a svelte-1jwxbu7" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-1jwxbu7" aria-hidden="true"></div> <section class="hero svelte-1jwxbu7"><div class="hero-text svelte-1jwxbu7"><p class="eyebrow svelte-1jwxbu7">Flota</p> <h1 class="svelte-1jwxbu7">Gestión de Vehículos</h1> <p class="lede svelte-1jwxbu7">Administra placas, capacidad y estado operativo de la flota.</p> <div class="chips svelte-1jwxbu7"><span class="chip success svelte-1jwxbu7">${escape_html(stats.operativos)} operativos</span> <span class="chip muted svelte-1jwxbu7">${escape_html(stats.inactivos)} inactivos</span></div></div> <div class="hero-actions svelte-1jwxbu7">`);
    if (puedeCrearVehiculos) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary svelte-1jwxbu7">+ Nuevo vehículo</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="panel svelte-1jwxbu7"><div class="panel-head svelte-1jwxbu7"><div><p class="label svelte-1jwxbu7">Listado</p> <h2 class="svelte-1jwxbu7">Vehículos</h2></div></div> `);
    if (store_get($$store_subs ??= {}, "$vehiculos", vehiculos).loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-1jwxbu7"><div class="spinner svelte-1jwxbu7"></div> <p>Cargando vehículos...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$vehiculos", vehiculos).items.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-1jwxbu7"><p>No hay vehículos registrados.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="table-wrap svelte-1jwxbu7"><table class="svelte-1jwxbu7"><thead class="svelte-1jwxbu7"><tr class="svelte-1jwxbu7"><th class="svelte-1jwxbu7">Placa</th><th class="svelte-1jwxbu7">Marca</th><th class="svelte-1jwxbu7">Modelo</th><th class="svelte-1jwxbu7">Año</th><th class="svelte-1jwxbu7">Capacidad</th><th class="svelte-1jwxbu7">Combustible</th><th class="svelte-1jwxbu7">Estado</th><th class="svelte-1jwxbu7"></th></tr></thead><tbody class="svelte-1jwxbu7"><!--[-->`);
        const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$vehiculos", vehiculos).items);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let v = each_array_1[$$index_1];
          $$renderer2.push(`<tr class="svelte-1jwxbu7"><td class="svelte-1jwxbu7">${escape_html(v.placa)}</td><td class="svelte-1jwxbu7">${escape_html(v.marca)}</td><td class="svelte-1jwxbu7">${escape_html(v.modelo)}</td><td class="svelte-1jwxbu7">${escape_html(v.año)}</td><td class="svelte-1jwxbu7">${escape_html(v.capacidad_carga)} kg</td><td class="svelte-1jwxbu7">${escape_html(v.tipo_combustible || "N/D")}</td><td class="svelte-1jwxbu7"><span${attr_class(`status-pill status-${estadoClass(v.estado_operativo)}`, "svelte-1jwxbu7")}>${escape_html(estadoLabel(v.estado_operativo))}</span></td><td class="actions svelte-1jwxbu7"><button class="ghost svelte-1jwxbu7">Ver</button> `);
          if (puedeEditarVehiculos) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="ghost svelte-1jwxbu7">Editar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeCambiarEstadoVehiculos) {
            $$renderer2.push("<!--[-->");
            if (v.estado_operativo === "inactivo") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<button class="success svelte-1jwxbu7">Activar</button>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<button class="danger svelte-1jwxbu7">Desactivar</button>`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeEliminarVehiculos) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="outline svelte-1jwxbu7">Eliminar</button>`);
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
