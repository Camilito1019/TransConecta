import { h as head, s as store_get, a as attr, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { a as auth } from "../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { V as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let contrasena_actual = "";
    let contrasena_nueva = "";
    let confirmar = "";
    let loading = false;
    head("t4vsop", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Cambiar contraseña - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-t4vsop"><div class="shape shape-a svelte-t4vsop" aria-hidden="true"></div> <div class="shape shape-b svelte-t4vsop" aria-hidden="true"></div> <section class="card svelte-t4vsop"><header class="card-head svelte-t4vsop"><p class="eyebrow svelte-t4vsop">Seguridad</p> <h1 class="svelte-t4vsop">Cambiar contraseña</h1> `);
    if (store_get($$store_subs ??= {}, "$auth", auth)?.usuario?.requiere_cambio_contrasena) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="subtitle required svelte-t4vsop">⚠️ Debes cambiar tu contraseña temporal antes de continuar</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="subtitle svelte-t4vsop">Actualiza tu clave con el mismo estilo del login.</p>`);
    }
    $$renderer2.push(`<!--]--></header> `);
    if (store_get($$store_subs ??= {}, "$auth", auth)?.usuario?.requiere_cambio_contrasena) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="warning-box svelte-t4vsop"><span class="ms-icon svelte-t4vsop" style="font-size: 24px;">info</span> <div><strong class="svelte-t4vsop">Primera vez en el sistema</strong> <p class="svelte-t4vsop">Por seguridad, debes cambiar tu contraseña temporal por una personalizada.</p></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <form class="form svelte-t4vsop"><label class="field svelte-t4vsop"><span>Contraseña actual</span> <div class="input-wrap svelte-t4vsop"><input${attr("type", "password")}${attr("value", contrasena_actual)} placeholder="••••••••" autocomplete="current-password" required${attr("disabled", loading, true)} class="svelte-t4vsop"/> <button type="button" class="eye svelte-t4vsop" aria-label="Mostrar u ocultar contraseña actual"><span class="ms-icon">${escape_html("visibility_off")}</span></button></div></label> <label class="field svelte-t4vsop"><span>Nueva contraseña</span> <div class="input-wrap svelte-t4vsop"><input${attr("type", "password")}${attr("value", contrasena_nueva)} placeholder="••••••••" autocomplete="new-password" required${attr("disabled", loading, true)} class="svelte-t4vsop"/> <button type="button" class="eye svelte-t4vsop" aria-label="Mostrar u ocultar nueva contraseña"><span class="ms-icon">${escape_html("visibility_off")}</span></button></div></label> <label class="field svelte-t4vsop"><span>Confirmar contraseña</span> <div class="input-wrap svelte-t4vsop"><input${attr("type", "password")}${attr("value", confirmar)} placeholder="Repite la contraseña" autocomplete="new-password" required${attr("disabled", loading, true)} class="svelte-t4vsop"/> <button type="button" class="eye svelte-t4vsop" aria-label="Mostrar u ocultar confirmación"><span class="ms-icon">${escape_html("visibility_off")}</span></button></div></label> <button class="primary svelte-t4vsop" type="submit"${attr("disabled", loading, true)}>${escape_html("Guardar cambios")}</button></form></section></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
