import { s as store_get, h as head, a as attr, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/stores.js";
import { p as puedeAccion, m as modulosConfig } from "../../../../chunks/permisos.js";
import { V as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const MODULO = "registroHoras";
    let puedeRegistrar = false;
    let conductores = [];
    let loadingConductores = true;
    let selectedId = "";
    let form = {
      fecha: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      hora_inicio: "",
      hora_fin: "",
      observaciones: ""
    };
    function diffHoras() {
      return 0;
    }
    store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig);
    {
      puedeRegistrar = puedeAccion(MODULO, "crear");
    }
    head("f3a5ef", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Registro de Horas - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-f3a5ef"><div class="bg-shape shape-a svelte-f3a5ef" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-f3a5ef" aria-hidden="true"></div> <section class="hero svelte-f3a5ef"><div class="hero-text svelte-f3a5ef"><p class="eyebrow svelte-f3a5ef">Operaciones</p> <h1 class="svelte-f3a5ef">Registro de Horas</h1> <p class="lede svelte-f3a5ef">Carga rápida de horas de conducción por conductor y fecha.</p> <div class="chips svelte-f3a5ef"><span class="chip success svelte-f3a5ef">${escape_html(conductores.length)} conductores</span> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></section> <section class="panel svelte-f3a5ef"><div class="panel-head svelte-f3a5ef"><div><p class="label svelte-f3a5ef">Formulario</p> <h2 class="svelte-f3a5ef">Registrar horas</h2></div></div> <div class="form-grid svelte-f3a5ef"><label class="field svelte-f3a5ef"><span>Conductor</span> `);
    $$renderer2.select(
      { value: selectedId, disabled: loadingConductores, class: "" },
      ($$renderer3) => {
        {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({}, ($$renderer4) => {
            $$renderer4.push(`Cargando...`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-f3a5ef"
    );
    $$renderer2.push(`</label> <label class="field svelte-f3a5ef"><span>Fecha</span> <input type="date"${attr("value", form.fecha)} class="svelte-f3a5ef"/></label> <label class="field svelte-f3a5ef"><span>Hora inicio</span> <input type="time"${attr("value", form.hora_inicio)} class="svelte-f3a5ef"/></label> <label class="field svelte-f3a5ef"><span>Hora fin</span> <input type="time"${attr("value", form.hora_fin)} class="svelte-f3a5ef"/></label> <label class="field svelte-f3a5ef"><span>Horas calculadas</span> <input type="text"${attr("value", `${diffHoras().toFixed(2)} h`)} readonly class="svelte-f3a5ef"/></label> <label class="field full svelte-f3a5ef"><span>Observaciones</span> <textarea rows="3" placeholder="Notas u observaciones" class="svelte-f3a5ef">`);
    const $$body = escape_html(form.observaciones);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></label> <div class="form-actions svelte-f3a5ef"><button class="primary svelte-f3a5ef"${attr("disabled", !puedeRegistrar, true)}>Registrar</button></div></div></section> <section class="panel svelte-f3a5ef"><div class="panel-head svelte-f3a5ef"><div><p class="label svelte-f3a5ef">Histórico</p> <h2 class="svelte-f3a5ef">Últimos registros</h2></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="empty svelte-f3a5ef"><p>No hay registros de horas para este conductor.</p></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
