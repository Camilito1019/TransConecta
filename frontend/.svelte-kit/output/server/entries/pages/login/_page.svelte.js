import { h as head, a as attr, e as ensure_array_like, d as bind_props } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { f as addNotificacion } from "../../../chunks/stores.js";
import { V as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let correo = "";
    let contraseña = "";
    let loading = false;
    let form = $$props["form"];
    const usuariosPrueba = [
      {
        nombre: "Mauricio Fernández",
        rol: "Coordinador",
        correo: "mauriciofernandez@gmail.com",
        contraseña: "Maufz_2025$2"
      },
      {
        nombre: "Mayra Alejandra Hoyos",
        rol: "HSEQ",
        correo: "mayraalejandrahoyos@gmail.com",
        contraseña: "MayraH@2025!"
      },
      {
        nombre: "Wilfran Camilo Castellanos",
        rol: "Administrador",
        correo: "wilfrancamilocastellanos@gmail.com",
        contraseña: "WccAdmin#92"
      },
      {
        nombre: "Yeison Ramírez",
        rol: "Coordinador",
        correo: "jasonramirez@gmail.com",
        contraseña: "JasonR*884"
      }
    ];
    if (form?.error) {
      addNotificacion(form.error, "error");
    }
    head("1x05zx6", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Login - TransConecta</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Inicia sesión en TransConecta"/> <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"/>`);
    });
    $$renderer2.push(`<div class="login-shell svelte-1x05zx6"><div class="shape shape-a svelte-1x05zx6" aria-hidden="true"></div> <div class="shape shape-b svelte-1x05zx6" aria-hidden="true"></div> <section class="login-card svelte-1x05zx6"><header class="login-header svelte-1x05zx6"><p class="eyebrow svelte-1x05zx6">Plataforma logística</p> <h1 class="svelte-1x05zx6">TransConecta</h1> <p class="subtitle svelte-1x05zx6">Opera tu red de transporte con seguridad y claridad.</p></header> <form method="POST" action="?/login" class="svelte-1x05zx6"><div class="form-grid svelte-1x05zx6"><label class="form-field svelte-1x05zx6"><span class="svelte-1x05zx6">Correo electrónico</span> <input type="email" id="correo" name="correo"${attr("value", correo)} placeholder="correo@example.com" required${attr("disabled", loading, true)} class="svelte-1x05zx6"/></label> <label class="form-field svelte-1x05zx6"><span class="svelte-1x05zx6">Contraseña</span> <div class="password-wrapper svelte-1x05zx6"><input${attr("type", "password")} id="contraseña" name="contraseña"${attr("value", contraseña)} placeholder="•••••••••" required${attr("disabled", loading, true)} class="svelte-1x05zx6"/> <button type="button" class="toggle-password svelte-1x05zx6"${attr("aria-label", "Mostrar contraseña")}${attr("disabled", loading, true)}><span class="ms-icon svelte-1x05zx6">${escape_html("visibility")}</span></button></div></label></div> <button type="submit" class="login-btn svelte-1x05zx6"${attr("disabled", !correo, true)}>${escape_html("Ingresar")}</button> <div class="form-footer svelte-1x05zx6"><button type="button" class="link-button svelte-1x05zx6">¿Olvidaste tu contraseña?</button></div></form> <div class="login-footer svelte-1x05zx6"><div class="footer-header svelte-1x05zx6"><span class="ms-icon svelte-1x05zx6">group</span> <p class="footer-title svelte-1x05zx6">Usuarios de prueba</p></div> <p class="footer-subtitle svelte-1x05zx6">Haz clic en un usuario para autocompletar las credenciales</p> <div class="users-grid svelte-1x05zx6"><!--[-->`);
    const each_array = ensure_array_like(usuariosPrueba);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let usuario = each_array[$$index];
      $$renderer2.push(`<button type="button" class="user-card svelte-1x05zx6"${attr("disabled", loading, true)} title="Clic para usar este usuario"><div class="user-avatar svelte-1x05zx6"><span class="ms-icon svelte-1x05zx6">person</span></div> <div class="user-info svelte-1x05zx6"><span class="user-nombre svelte-1x05zx6">${escape_html(usuario.nombre)}</span> <span class="user-rol svelte-1x05zx6"><span class="role-badge svelte-1x05zx6">${escape_html(usuario.rol)}</span></span></div> <span class="ms-icon arrow svelte-1x05zx6">arrow_forward</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div></section></div>`);
    bind_props($$props, { form });
  });
}
export {
  _page as default
};
