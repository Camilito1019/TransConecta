import { db } from "../config/db.js";

const ESTADOS_PERMITIDOS = ["activo", "inactivo"];

const normalizarNombre = (nombre = "") => nombre.trim();
const normalizarTelefono = (telefono = "") => telefono.trim();

export const listarClientes = async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT id_cliente, nombre, telefono, estado, fecha_creacion, fecha_actualizacion
       FROM cliente
       ORDER BY nombre`
    );
    res.json({ total: result.rows.length, clientes: result.rows });
  } catch (error) {
    console.error("Error listando clientes:", error);
    res.status(500).json({ error: "Error al listar clientes" });
  }
};

export const crearCliente = async (req, res) => {
  try {
    const nombre = normalizarNombre(req.body?.nombre || "");
    const telefono = normalizarTelefono(req.body?.telefono || "");

    if (!nombre) {
      return res.status(400).json({ error: "El nombre del cliente es obligatorio" });
    }

    // Validar longitud
    if (nombre.length > 150) {
      return res.status(400).json({ error: "El nombre no debe superar 150 caracteres" });
    }
    if (telefono && telefono.length > 30) {
      return res.status(400).json({ error: "El teléfono no debe superar 30 caracteres" });
    }

    // Verificar duplicado por nombre (case-insensitive)
    const duplicado = await db.query("SELECT 1 FROM cliente WHERE LOWER(nombre) = LOWER($1) LIMIT 1", [nombre]);
    if (duplicado.rows.length > 0) {
      return res.status(409).json({ error: "Ya existe un cliente con ese nombre" });
    }

    const insert = await db.query(
      `INSERT INTO cliente (nombre, telefono)
       VALUES ($1, NULLIF($2, ''))
       RETURNING id_cliente, nombre, telefono, estado, fecha_creacion, fecha_actualizacion`,
      [nombre, telefono]
    );

    res.status(201).json({ mensaje: "Cliente creado", cliente: insert.rows[0] });
  } catch (error) {
    console.error("Error creando cliente:", error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

export const verCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    if (!id_cliente || isNaN(id_cliente)) {
      return res.status(400).json({ error: "id_cliente inválido" });
    }

    const result = await db.query(
      `SELECT id_cliente, nombre, telefono, estado, fecha_creacion, fecha_actualizacion
       FROM cliente
       WHERE id_cliente = $1`,
      [id_cliente]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo cliente:", error);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
};

export const actualizarCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    if (!id_cliente || isNaN(id_cliente)) {
      return res.status(400).json({ error: "id_cliente inválido" });
    }

    const existe = await db.query("SELECT * FROM cliente WHERE id_cliente = $1", [id_cliente]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const nombreRaw = req.body?.nombre;
    const telefonoRaw = req.body?.telefono;
    const estadoRaw = req.body?.estado;

    const nombre = nombreRaw !== undefined ? normalizarNombre(nombreRaw || "") : undefined;
    const telefono = telefonoRaw !== undefined ? normalizarTelefono(telefonoRaw || "") : undefined;
    const estado = estadoRaw !== undefined && estadoRaw !== null ? String(estadoRaw).toLowerCase() : undefined;

    if (nombre !== undefined && !nombre) {
      return res.status(400).json({ error: "El nombre del cliente es obligatorio" });
    }
    if (nombre !== undefined && nombre.length > 150) {
      return res.status(400).json({ error: "El nombre no debe superar 150 caracteres" });
    }
    if (telefono !== undefined && telefono.length > 30) {
      return res.status(400).json({ error: "El teléfono no debe superar 30 caracteres" });
    }
    if (estado !== undefined && !ESTADOS_PERMITIDOS.includes(estado)) {
      return res.status(400).json({ error: "estado debe ser 'activo' o 'inactivo'" });
    }

    if (nombre !== undefined) {
      const duplicado = await db.query(
        "SELECT 1 FROM cliente WHERE LOWER(nombre) = LOWER($1) AND id_cliente <> $2 LIMIT 1",
        [nombre, id_cliente]
      );
      if (duplicado.rows.length > 0) {
        return res.status(409).json({ error: "Ya existe un cliente con ese nombre" });
      }
    }

    const update = await db.query(
      `UPDATE cliente
       SET nombre = COALESCE($1, nombre),
           telefono = COALESCE(NULLIF($2, ''), telefono),
           estado = COALESCE($3, estado),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_cliente = $4
       RETURNING id_cliente, nombre, telefono, estado, fecha_creacion, fecha_actualizacion`,
      [nombre ?? null, telefono ?? null, estado ?? null, id_cliente]
    );

    res.json({ mensaje: "Cliente actualizado", cliente: update.rows[0] });
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

export const desactivarCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    if (!id_cliente || isNaN(id_cliente)) {
      return res.status(400).json({ error: "id_cliente inválido" });
    }

    const result = await db.query(
      `UPDATE cliente SET estado = 'inactivo', fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_cliente = $1
       RETURNING id_cliente, nombre, telefono, estado`,
      [id_cliente]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente desactivado", cliente: result.rows[0] });
  } catch (error) {
    console.error("Error desactivando cliente:", error);
    res.status(500).json({ error: "Error al desactivar cliente" });
  }
};

export const activarCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    if (!id_cliente || isNaN(id_cliente)) {
      return res.status(400).json({ error: "id_cliente inválido" });
    }

    const result = await db.query(
      `UPDATE cliente SET estado = 'activo', fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_cliente = $1
       RETURNING id_cliente, nombre, telefono, estado`,
      [id_cliente]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente activado", cliente: result.rows[0] });
  } catch (error) {
    console.error("Error activando cliente:", error);
    res.status(500).json({ error: "Error al activar cliente" });
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    if (!id_cliente || isNaN(id_cliente)) {
      return res.status(400).json({ error: "id_cliente inválido" });
    }

    // Evitar eliminar si está referenciado por trayectos
    const refs = await db.query("SELECT 1 FROM trayecto WHERE id_cliente = $1 LIMIT 1", [id_cliente]);
    if (refs.rows.length > 0) {
      return res.status(409).json({ error: "No se puede eliminar: hay trayectos asociados" });
    }

    const result = await db.query(
      `DELETE FROM cliente WHERE id_cliente = $1
       RETURNING id_cliente, nombre, telefono, estado`,
      [id_cliente]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente eliminado", cliente: result.rows[0] });
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};
