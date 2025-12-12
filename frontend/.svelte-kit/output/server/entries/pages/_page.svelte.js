import { s as store_get, h as head, u as unsubscribe_stores } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import { V as escape_html } from "../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { a as auth } from "../../chunks/stores.js";
import { M as MODULOS, p as puedeAccion, m as modulosConfig } from "../../chunks/permisos.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let rolActual, cfgRol;
    const SIDEBAR_MODULOS = [
      "dashboard",
      "usuarios",
      "clientes",
      "vehiculos",
      "conductores",
      "trayectos",
      "asignaciones",
      "roles",
      "registroHoras"
    ];
    const MODULE_META = {
      dashboard: {
        label: "Dashboard",
        icon: "home",
        path: "/",
        description: "Visión general y métricas clave."
      },
      usuarios: {
        label: "Usuarios",
        icon: "group",
        path: "/usuarios",
        description: "Administra usuarios, roles y estados."
      },
      clientes: {
        label: "Clientes",
        icon: "apartment",
        path: "/clientes",
        description: "Gestiona clientes y su estado."
      },
      roles: {
        label: "Roles",
        icon: "admin_panel_settings",
        path: "/roles",
        description: "Define roles y permisos por rol."
      },
      modulos: {
        label: "Módulos",
        icon: "tune",
        path: "/modulos",
        description: "Configura visibilidad y acciones por rol."
      },
      vehiculos: {
        label: "Vehículos",
        icon: "local_shipping",
        path: "/vehiculos",
        description: "Control de flota, documentos y estados."
      },
      conductores: {
        label: "Conductores",
        icon: "badge",
        path: "/conductores",
        description: "Gestión de conductores, alertas y estados."
      },
      trayectos: {
        label: "Trayectos",
        icon: "map",
        path: "/trayectos",
        description: "Rutas, planificación y operación."
      },
      asignaciones: {
        label: "Asignaciones",
        icon: "route",
        path: "/asignaciones",
        description: "Asigna trayectos a vehículos y conductores."
      },
      registroHoras: {
        label: "Registro de Horas",
        icon: "schedule",
        path: "/operaciones/horas",
        description: "Registra horas de conducción por conductor."
      }
    };
    let totals = {
      usuarios: 0,
      clientes: 0,
      roles: 0,
      vehiculos: 0,
      conductores: 0,
      trayectos: 0,
      asignaciones: 0,
      modulos: SIDEBAR_MODULOS.length
    };
    let percents = {
      usuariosActivos: 0,
      clientesActivos: 0,
      vehiculosOperativos: 0,
      vehiculosEnRuta: 0,
      conductoresNoInactivos: 0,
      conductoresEnRuta: 0,
      trayectosAsignados: 0
    };
    let modulosHabilitadosPct = 0;
    const pct = (part, total) => {
      const p = Number(part) || 0;
      const t = Number(total) || 0;
      if (t <= 0) return 0;
      return Math.max(0, Math.min(100, Math.round(p / t * 100)));
    };
    rolActual = store_get($$store_subs ??= {}, "$auth", auth)?.usuario?.nombre_rol ? String(store_get($$store_subs ??= {}, "$auth", auth).usuario.nombre_rol).toUpperCase() : null;
    cfgRol = rolActual ? store_get($$store_subs ??= {}, "$modulosConfig", modulosConfig)?.[rolActual] : null;
    {
      const habilitados = cfgRol ? SIDEBAR_MODULOS.filter((m) => cfgRol?.[m]?.sidebar === true && cfgRol?.[m]?.acciones?.ver === true) : [];
      modulosHabilitadosPct = pct(habilitados.length, SIDEBAR_MODULOS.length);
    }
    {
      MODULOS.filter((m) => m !== "dashboard").map((modulo) => {
        const meta = MODULE_META[modulo] || { label: modulo, icon: "apps", path: "/" };
        const sinAcceso = !puedeAccion(modulo, "ver");
        let value = "—";
        let percentValue = null;
        let percentLabel = "";
        if (modulo === "usuarios") {
          value = totals.usuarios;
          percentValue = percents.usuariosActivos;
          percentLabel = "activos";
        } else if (modulo === "clientes") {
          value = totals.clientes;
          percentValue = percents.clientesActivos;
          percentLabel = "activos";
        } else if (modulo === "roles") {
          value = totals.roles;
        } else if (modulo === "modulos") {
          value = totals.modulos;
          percentValue = modulosHabilitadosPct;
          percentLabel = "habilitados";
        } else if (modulo === "vehiculos") {
          value = totals.vehiculos;
          percentValue = percents.vehiculosOperativos;
          percentLabel = "operativos";
        } else if (modulo === "conductores") {
          value = totals.conductores;
          percentValue = percents.conductoresNoInactivos;
          percentLabel = "disponibles";
        } else if (modulo === "trayectos") {
          value = totals.trayectos;
          percentValue = percents.trayectosAsignados;
          percentLabel = "asignados";
        } else if (modulo === "asignaciones") {
          value = totals.asignaciones;
          percentValue = percents.vehiculosEnRuta;
          percentLabel = "flota en ruta";
        } else if (modulo === "registroHoras") {
          value = totals.conductores;
          percentValue = percents.conductoresEnRuta;
          percentLabel = "conductores en ruta";
        }
        return {
          modulo,
          label: meta.label,
          icon: meta.icon,
          path: meta.path,
          description: meta.description,
          value,
          percentValue,
          percentLabel,
          disabled: sinAcceso
        };
      });
    }
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Dashboard - TransConecta</title>`);
      });
    });
    $$renderer2.push(`<div class="page-shell svelte-1uha8ag"><div class="bg-shape shape-a svelte-1uha8ag" aria-hidden="true"></div> <div class="bg-shape shape-b svelte-1uha8ag" aria-hidden="true"></div> <section class="hero svelte-1uha8ag"><div class="hero-text svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">Panel operativo</p> <h1 class="svelte-1uha8ag">Bienvenido a TransConecta</h1> <p class="lede svelte-1uha8ag">Opera tu red de transporte con visibilidad, seguridad y control en tiempo real.</p> <div class="hero-meta svelte-1uha8ag"><span class="chip success svelte-1uha8ag"><span class="dot svelte-1uha8ag"></span> Sesión activa</span> <span class="chip soft svelte-1uha8ag">Datos actualizados</span></div></div> <div class="hero-card svelte-1uha8ag"><p class="label svelte-1uha8ag">Resumen rápido</p> <div class="hero-stats svelte-1uha8ag"><div class="mini-stat svelte-1uha8ag"><span class="svelte-1uha8ag">Usuarios</span> <strong class="svelte-1uha8ag">${escape_html("—")}</strong></div> <div class="mini-stat svelte-1uha8ag"><span class="svelte-1uha8ag">Vehículos</span> <strong class="svelte-1uha8ag">${escape_html("—")}</strong></div> <div class="mini-stat svelte-1uha8ag"><span class="svelte-1uha8ag">Asignaciones</span> <strong class="svelte-1uha8ag">${escape_html("—")}</strong></div></div> <p class="hint svelte-1uha8ag">Monitorea tu operación y accede rápido a cada módulo.</p></div></section> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-1uha8ag"><div class="spinner svelte-1uha8ag" aria-hidden="true"></div> <p>Cargando estadísticas...</p></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
