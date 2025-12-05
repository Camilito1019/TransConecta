import Dashboard from './pages/Dashboard.svelte';
import Login from './pages/Login.svelte';
import Usuarios from './pages/Usuarios.svelte';
import Vehiculos from './pages/Vehiculos.svelte';
import Conductores from './pages/Conductores.svelte';
import Trayectos from './pages/Trayectos.svelte';
import Roles from './pages/Roles.svelte';
import Asignaciones from './pages/Asignaciones.svelte';
import NotFound from './pages/NotFound.svelte';

export const routes = {
  '/': Dashboard,
  '/login': Login,
  '/usuarios': Usuarios,
  '/vehiculos': Vehiculos,
  '/conductores': Conductores,
  '/trayectos': Trayectos,
  '/roles': Roles,
  '/asignaciones': Asignaciones,
  '*': NotFound,
};
