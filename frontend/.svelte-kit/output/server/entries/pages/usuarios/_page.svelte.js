import { s as store_get, h as head, e as ensure_array_like, b as attr_class, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { V as escape_html } from "../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { u as usuarios } from "../../../chunks/stores.js";
import { a as puedeCrear, b as puedeEditar, c as puedeEliminar, d as puedeCambiarEstado, m as modulosConfig } from "../../../chunks/permisos.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let stats;
    const MODULO = "usuarios";
    let puedeCrearUsuarios = false;
    let puedeEditarUsuarios = false;
    let puedeEliminarUsuarios = false;
    let puedeCambiarEstadoUsuarios = false;
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      puedeCrearUsuarios = puedeCrear(MODULO);
      puedeEditarUsuarios = puedeEditar(MODULO);
      puedeEliminarUsuarios = puedeEliminar(MODULO);
      puedeCambiarEstadoUsuarios = puedeCambiarEstado(MODULO);
    }
    stats = {
      total: store_get($$store_subs ??= {}, "$usuarios", usuarios).items.length,
      activos: store_get($$store_subs ??= {}, "$usuarios", usuarios).items.filter((u) => u.estado === "activo").length,
      inactivos: store_get($$store_subs ??= {}, "$usuarios", usuarios).items.filter((u) => u.estado === "inactivo").length
    };
    head("1cfum5m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Gestión de Usuarios - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-1cfum5m"><div class="bg-shape shape-a svelte-1cfum5m" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-1cfum5m" aria-hidden="true"></div> <section class="hero svelte-1cfum5m"><div class="hero-text svelte-1cfum5m"><p class="eyebrow svelte-1cfum5m">Equipo</p> <h1 class="svelte-1cfum5m">Gestión de Usuarios</h1> <p class="lede svelte-1cfum5m">Administra cuentas, roles y estado operativo de tu equipo.</p> <div class="chips svelte-1cfum5m"><span class="chip success svelte-1cfum5m">${escape_html(stats.activos)} activos</span> <span class="chip muted svelte-1cfum5m">${escape_html(stats.inactivos)} inactivos</span></div></div> <div class="hero-actions svelte-1cfum5m">`);
    if (puedeCrearUsuarios) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary svelte-1cfum5m">+ Nuevo usuario</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></section> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="panel svelte-1cfum5m"><div class="panel-head svelte-1cfum5m"><div><p class="label svelte-1cfum5m">Listado</p> <h2 class="svelte-1cfum5m">Usuarios</h2></div></div> `);
    if (store_get($$store_subs ??= {}, "$usuarios", usuarios).loading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-1cfum5m"><div class="spinner svelte-1cfum5m"></div> <p>Cargando usuarios...</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$usuarios", usuarios).items.length === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-1cfum5m"><p>No hay usuarios registrados.</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="table-wrap svelte-1cfum5m"><table class="svelte-1cfum5m"><thead class="svelte-1cfum5m"><tr class="svelte-1cfum5m"><th class="svelte-1cfum5m">Usuario</th><th class="svelte-1cfum5m">Correo</th><th class="svelte-1cfum5m">Rol</th><th class="svelte-1cfum5m">Estado</th><th class="svelte-1cfum5m">Creación</th><th class="svelte-1cfum5m"></th></tr></thead><tbody class="svelte-1cfum5m"><!--[-->`);
        const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$usuarios", usuarios).items);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let user = each_array_1[$$index_1];
          $$renderer2.push(`<tr class="svelte-1cfum5m"><td class="svelte-1cfum5m">${escape_html(user.nombre_usuario)}</td><td class="svelte-1cfum5m">${escape_html(user.correo)}</td><td class="svelte-1cfum5m"><span class="pill svelte-1cfum5m">${escape_html(user.nombre_rol || "N/A")}</span></td><td class="svelte-1cfum5m"><span${attr_class(`status ${user.estado === "activo" ? "green" : "red"}`, "svelte-1cfum5m")}>${escape_html(user.estado)}</span></td><td class="svelte-1cfum5m">${escape_html(new Date(user.fecha_creacion).toLocaleDateString())}</td><td class="actions svelte-1cfum5m">`);
          if (puedeEditarUsuarios) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="ghost svelte-1cfum5m">Editar</button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeCambiarEstadoUsuarios) {
            $$renderer2.push("<!--[-->");
            if (user.estado === "activo") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<button class="danger svelte-1cfum5m">Desactivar</button>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<button class="success svelte-1cfum5m">Activar</button>`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (puedeEliminarUsuarios) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="outline svelte-1cfum5m">Eliminar</button>`);
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
