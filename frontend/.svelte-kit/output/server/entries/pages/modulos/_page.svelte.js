import { s as store_get, h as head, a as attr, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "../../../chunks/stores.js";
import { g as getRolActual, m as modulosConfig, e as modulosCargando } from "../../../chunks/permisos.js";
import { V as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let config, rolesDisponibles;
    const rolPorDefecto = getRolActual() || "ADMINISTRADOR";
    let rolActivo = rolPorDefecto;
    let configLocal = {};
    let cargandoInicial = true;
    config = store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    rolesDisponibles = Object.keys(config || {});
    if (configLocal && Object.keys(configLocal).length > 0) {
      console.log("📊 ConfigLocal actualizado:", JSON.parse(JSON.stringify(configLocal)));
      console.log("📈 Módulos cargados:", Object.keys(configLocal).length);
    }
    head("mktw6w", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Configurar Módulos - TransConecta</title>`);
      });
      $$renderer3.push(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" class="svelte-mktw6w"/>`);
    });
    $$renderer2.push(`<div class="page-shell svelte-mktw6w"><div class="bg-shape shape-a svelte-mktw6w" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-mktw6w" aria-hidden="true"></div> <section class="hero svelte-mktw6w"><div class="hero-text svelte-mktw6w"><p class="eyebrow svelte-mktw6w">Permisos</p> <h1 class="svelte-mktw6w">Configurar visibilidad y acciones</h1> <p class="lede svelte-mktw6w">Activa qué módulos aparecen en el sidebar y qué acciones (ver, editar, eliminar, desactivar) están disponibles por rol.</p> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="hero-actions svelte-mktw6w"><button class="ghost svelte-mktw6w"${attr("disabled", store_get($$store_subs ??= {}, "$modulosCargando", modulosCargando), true)}>Restablecer rol</button> <button class="outline svelte-mktw6w"${attr("disabled", store_get($$store_subs ??= {}, "$modulosCargando", modulosCargando), true)}>Restablecer todo</button> <button class="primary svelte-mktw6w"${attr("disabled", store_get($$store_subs ??= {}, "$modulosCargando", modulosCargando) || true, true)}>${escape_html("Guardar cambios")}</button></div></section> <section class="panel svelte-mktw6w"><div class="panel-head svelte-mktw6w"><div class="svelte-mktw6w"><p class="label svelte-mktw6w">Rol objetivo</p> <h2 class="svelte-mktw6w">Permisos para rol</h2></div> `);
    $$renderer2.select(
      {
        class: "select",
        value: rolActivo,
        disabled: store_get($$store_subs ??= {}, "$modulosCargando", modulosCargando) || cargandoInicial
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(rolesDisponibles);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let rol = each_array[$$index];
          $$renderer3.option(
            { value: rol, class: "" },
            ($$renderer4) => {
              $$renderer4.push(`${escape_html(rol)}`);
            },
            "svelte-mktw6w"
          );
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-mktw6w"
    );
    $$renderer2.push(`</div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-mktw6w"><div class="spinner svelte-mktw6w"></div> <p class="svelte-mktw6w">Cargando configuración de módulos...</p></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
