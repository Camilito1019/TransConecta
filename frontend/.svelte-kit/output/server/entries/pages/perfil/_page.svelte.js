import { h as head, s as store_get, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { a as auth } from "../../../chunks/stores.js";
import { V as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const avatarInitials = (nombre) => {
      if (!nombre) return "TC";
      return nombre.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };
    head("x3vgov", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Mi Perfil - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="profile-shell svelte-x3vgov"><div class="bg shape-a svelte-x3vgov" aria-hidden="true"></div> <div class="bg shape-b svelte-x3vgov" aria-hidden="true"></div> <section class="profile-card svelte-x3vgov"><header class="profile-head svelte-x3vgov"><div class="avatar svelte-x3vgov">${escape_html(avatarInitials(store_get($$store_subs ??= {}, "$auth", auth).usuario?.nombre_usuario))}</div> <div class="head-text svelte-x3vgov"><p class="eyebrow svelte-x3vgov">Cuenta</p> <h1 class="svelte-x3vgov">Mi Perfil</h1> <p class="lede svelte-x3vgov">Revisa y actualiza tus datos personales.</p> <div class="chips svelte-x3vgov"><span class="chip svelte-x3vgov">${escape_html(store_get($$store_subs ??= {}, "$auth", auth).usuario?.correo || "correo@dominio.com")}</span> <span class="chip soft svelte-x3vgov">${escape_html(store_get($$store_subs ??= {}, "$auth", auth).nombre_rol || store_get($$store_subs ??= {}, "$auth", auth).usuario?.nombre_rol || "Rol")}</span> <span class="chip state svelte-x3vgov">${escape_html((store_get($$store_subs ??= {}, "$auth", auth).usuario?.estado || "activo").toUpperCase())}</span></div></div></header> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-x3vgov"><div class="spinner svelte-x3vgov"></div> <p>Cargando tu perfil...</p></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
