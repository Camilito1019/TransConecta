import { h as head, b as attr_class, a as attr } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "../../../chunks/stores.js";
import { V as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let paso = 1;
    let correo = "";
    let codigo = "";
    let loading = false;
    function limpiarCodigo(valor) {
      return valor.replace(/\D/g, "").slice(0, 6);
    }
    codigo = limpiarCodigo(codigo);
    head("jwh3ob", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Recuperar Contraseña - TransConecta</title>`);
      });
      $$renderer3.push(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"/>`);
    });
    $$renderer2.push(`<div class="recovery-shell svelte-jwh3ob"><div class="shape shape-a svelte-jwh3ob" aria-hidden="true"></div> <div class="shape shape-b svelte-jwh3ob" aria-hidden="true"></div> <section class="recovery-card svelte-jwh3ob"><header class="recovery-header svelte-jwh3ob"><button class="back-btn svelte-jwh3ob" aria-label="Volver al login"><span class="ms-icon">arrow_back</span></button> <h1 class="svelte-jwh3ob">Recuperar Contraseña</h1> <p class="subtitle svelte-jwh3ob">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`Ingresa tu correo para recibir un código de verificación`);
    }
    $$renderer2.push(`<!--]--></p></header> <div class="steps-indicator svelte-jwh3ob"><div${attr_class("step svelte-jwh3ob", void 0, { "active": paso >= 1, "completed": paso > 1 })}><span class="step-number svelte-jwh3ob">1</span> <span class="step-label svelte-jwh3ob">Correo</span></div> <div${attr_class("step-line svelte-jwh3ob", void 0, { "completed": paso > 1 })}></div> <div${attr_class("step svelte-jwh3ob", void 0, { "active": paso >= 2, "completed": paso > 2 })}><span class="step-number svelte-jwh3ob">2</span> <span class="step-label svelte-jwh3ob">Código</span></div> <div${attr_class("step-line svelte-jwh3ob", void 0, { "completed": paso > 2 })}></div> <div${attr_class("step svelte-jwh3ob", void 0, { "active": paso >= 3 })}><span class="step-number svelte-jwh3ob">3</span> <span class="step-label svelte-jwh3ob">Nueva contraseña</span></div></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<form class="svelte-jwh3ob"><div class="form-field svelte-jwh3ob"><label for="correo" class="svelte-jwh3ob">Correo electrónico</label> <input type="email" id="correo"${attr("value", correo)} placeholder="correo@example.com" required${attr("disabled", loading, true)} class="svelte-jwh3ob"/></div> <button type="submit" class="btn-primary svelte-jwh3ob"${attr("disabled", !correo, true)}>${escape_html("Enviar código")}</button></form>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section></div>`);
  });
}
export {
  _page as default
};
