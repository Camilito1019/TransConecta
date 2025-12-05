const estadoLabels = {
  operativo: "Operativo",
  en_ruta: "En ruta",
  en_mantenimiento: "En mantenimiento",
  activo: "Activo",
  inactivo: "Inactivo",
  asignado: "Asignado",
  en_ruta_asignacion: "En ruta",
  completado: "Completado"
};

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const titleCase = (text) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const estadoLabel = (estado) => {
  const key = normalize(estado);
  if (estadoLabels[key]) return estadoLabels[key];
  const readable = key.replace(/[_-]+/g, " ").trim();
  return readable ? titleCase(readable) : "Desconocido";
};

export const estadoClass = (estado) => {
  const key = normalize(estado);
  const cleaned = key.replace(/[_\s]+/g, "-").replace(/[^a-z0-9-]+/g, "").replace(/^-+|-+$/g, "");
  return cleaned || "desconocido";
};
