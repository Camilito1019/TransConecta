import { db } from "../config/db.js";

// Helper: validación simple
function isValidEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
}

export const crearVehiculo = async (req, res) => {
  try {
    const { placa, marca, modelo, año, capacidad_carga, estado_operativo } = req.body;

    if (!placa || !marca || !modelo || !año || capacidad_carga === undefined || capacidad_carga === null) {
      return res.status(400).json({ error: "Faltan campos requeridos: placa, marca, modelo, año, capacidad_carga" });
    }

    const yearNum = Number(año);
    const capNum = Number(capacidad_carga);
    if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({ error: "Año inválido" });
    }
    if (Number.isNaN(capNum) || capNum <= 0) {
      return res.status(400).json({ error: "capacidad_carga debe ser numérica y mayor a 0" });
    }

    const estado = estado_operativo || 'operativo';
    const estadosPermitidos = ['operativo', 'en_mantenimiento', 'en_ruta', 'inactivo'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: "estado_operativo inválido" });
    }

    // Verificar que placa es única
    const exists = await db.query("SELECT id_vehiculo FROM Vehiculo WHERE placa = $1", [placa]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "La placa ya está registrada" });
    }

    const query = `
      INSERT INTO Vehiculo (placa, marca, modelo, año, capacidad_carga, estado_operativo, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id_vehiculo, placa, marca, modelo, año, capacidad_carga, estado_operativo, fecha_registro
    `;

    const values = [placa, marca, modelo, yearNum, capNum, estado];
    const result = await db.query(query, values);

    res.status(201).json({ 
      mensaje: "Vehículo creado exitosamente", 
      vehiculo: result.rows[0] 
    });
  } catch (error) {
    console.error("Error creando vehículo:", error);
    res.status(500).json({ error: "Error al crear vehículo" });
  }
};

// Listar todos los vehículos
export const listarVehiculos = async (req, res) => {
  try {
    const query = `
      SELECT id_vehiculo, placa, marca, modelo, año, capacidad_carga, estado_operativo, fecha_registro
      FROM Vehiculo
      ORDER BY id_vehiculo
    `;
    const result = await db.query(query);
    res.json({ total: result.rows.length, vehiculos: result.rows });
  } catch (error) {
    console.error("Error listando vehículos:", error);
    res.status(500).json({ error: "Error al listar vehículos" });
  }
};

// Obtener vehículo por ID
export const obtenerVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    const query = `
      SELECT id_vehiculo, placa, marca, modelo, año, capacidad_carga, estado_operativo, fecha_registro
      FROM Vehiculo
      WHERE id_vehiculo = $1
    `;
    const result = await db.query(query, [id_vehiculo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo vehículo:", error);
    res.status(500).json({ error: "Error al obtener vehículo" });
  }
};

// Actualizar características del vehículo
export const actualizarVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    const { placa, marca, modelo, año, capacidad_carga, estado_operativo } = req.body;

    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    const yearNum = año !== undefined && año !== null ? Number(año) : null;
    const capNum = capacidad_carga !== undefined && capacidad_carga !== null ? Number(capacidad_carga) : null;
    if (yearNum !== null && (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100)) {
      return res.status(400).json({ error: "Año inválido" });
    }
    if (capNum !== null && (Number.isNaN(capNum) || capNum <= 0)) {
      return res.status(400).json({ error: "capacidad_carga debe ser numérica y mayor a 0" });
    }
    if (estado_operativo) {
      const estadosPermitidos = ['operativo', 'en_mantenimiento', 'en_ruta', 'inactivo'];
      if (!estadosPermitidos.includes(estado_operativo)) {
        return res.status(400).json({ error: "estado_operativo inválido" });
      }
    }

    // Verificar existencia
    const exists = await db.query("SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = $1", [id_vehiculo]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // Si se cambia la placa, verificar unicidad
    if (placa) {
      const placaExists = await db.query(
        "SELECT id_vehiculo FROM Vehiculo WHERE placa = $1 AND id_vehiculo <> $2",
        [placa, id_vehiculo]
      );
      if (placaExists.rows.length > 0) {
        return res.status(409).json({ error: "La placa ya está registrada" });
      }
    }

    const query = `
      UPDATE Vehiculo
      SET placa = COALESCE($1, placa),
          marca = COALESCE($2, marca),
          modelo = COALESCE($3, modelo),
          año = COALESCE($4, año),
          capacidad_carga = COALESCE($5, capacidad_carga),
          estado_operativo = COALESCE($6, estado_operativo)
      WHERE id_vehiculo = $7
      RETURNING id_vehiculo, placa, marca, modelo, año, capacidad_carga, estado_operativo, fecha_registro
    `;

    const values = [placa || null, marca || null, modelo || null, yearNum, capNum, estado_operativo || null, id_vehiculo];
    const result = await db.query(query, values);

    res.json({ 
      mensaje: "Vehículo actualizado exitosamente", 
      vehiculo: result.rows[0] 
    });
  } catch (error) {
    console.error("Error actualizando vehículo:", error);
    res.status(500).json({ error: "Error al actualizar vehículo" });
  }
};

// Desactivar vehículo
export const desactivarVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    const query = `
      UPDATE Vehiculo
      SET estado_operativo = 'inactivo'
      WHERE id_vehiculo = $1
      RETURNING id_vehiculo, placa, marca, modelo, año, capacidad_carga, estado_operativo
    `;
    const result = await db.query(query, [id_vehiculo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ 
      mensaje: "Vehículo desactivado", 
      vehiculo: result.rows[0] 
    });
  } catch (error) {
    console.error("Error desactivando vehículo:", error);
    res.status(500).json({ error: "Error al desactivar vehículo" });
  }
};

// Activar vehículo
export const activarVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    const query = `
      UPDATE Vehiculo
      SET estado_operativo = 'operativo'
      WHERE id_vehiculo = $1
      RETURNING id_vehiculo, placa, marca, modelo, año, capacidad_carga, estado_operativo
    `;
    const result = await db.query(query, [id_vehiculo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ 
      mensaje: "Vehículo activado", 
      vehiculo: result.rows[0] 
    });
  } catch (error) {
    console.error("Error activando vehículo:", error);
    res.status(500).json({ error: "Error al activar vehículo" });
  }
};

// Eliminar vehículo
export const eliminarVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    const query = `DELETE FROM Vehiculo WHERE id_vehiculo = $1 RETURNING id_vehiculo, placa, marca, modelo`;
    const result = await db.query(query, [id_vehiculo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ mensaje: "Vehículo eliminado", vehiculo: result.rows[0] });
  } catch (error) {
    console.error("Error eliminando vehículo:", error);
    res.status(500).json({ error: "Error al eliminar vehículo" });
  }
};

// Registrar estado operativo
export const registrarEstadoOperativo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    const { estado_operativo, observaciones } = req.body;

    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    if (!estado_operativo || !['operativo', 'en_mantenimiento', 'en_ruta', 'inactivo'].includes(estado_operativo)) {
      return res.status(400).json({ error: "estado_operativo debe ser: operativo, en_mantenimiento, en_ruta o inactivo" });
    }

    const query = `
      UPDATE Vehiculo
      SET estado_operativo = $1
      WHERE id_vehiculo = $2
      RETURNING id_vehiculo, placa, marca, modelo, año, capacidad_carga, estado_operativo
    `;
    const result = await db.query(query, [estado_operativo, id_vehiculo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // Registrar evento en Historial_Vehiculo
    try {
      const descripcion_evento = observaciones && observaciones.trim().length > 0
        ? observaciones
        : `Cambio de estado a ${estado_operativo}`;

      const historialQuery = `
        INSERT INTO Historial_Vehiculo (id_vehiculo, descripcion_evento, fecha_evento)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        RETURNING id_historial, id_vehiculo, descripcion_evento, fecha_evento
      `;
      const historialValues = [id_vehiculo, descripcion_evento];
      await db.query(historialQuery, historialValues);
    } catch (histErr) {
      // No interrumpir el flujo si el registro de historial falla, pero loguearlo
      console.error('Error registrando historial del vehículo:', histErr);
    }

    res.json({ 
      mensaje: "Estado operativo actualizado",
      vehiculo: result.rows[0],
      observaciones: observaciones || null
    });
  } catch (error) {
    console.error("Error registrando estado:", error);
    res.status(500).json({ error: "Error al registrar estado operativo" });
  }
};

// Subir documento de vehículo
export const subirDocumento = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    const { tipo_documento } = req.body;

    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    if (!tipo_documento) {
      return res.status(400).json({ error: "tipo_documento es requerido" });
    }

    // Verificar que el vehículo existe
    const vehiculoCheck = await db.query("SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = $1", [id_vehiculo]);
    if (vehiculoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // URL relativa del archivo
    const archivo_url = `/uploads/vehiculos/${req.file.filename}`;

    const query = `
      INSERT INTO documento_vehiculo (id_vehiculo, tipo_documento, archivo_url, fecha_carga)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id_documento, id_vehiculo, tipo_documento, archivo_url, fecha_carga
    `;

    const values = [id_vehiculo, tipo_documento, archivo_url];
    const result = await db.query(query, values);

    res.status(201).json({ 
      mensaje: "Documento subido exitosamente",
      documento: result.rows[0]
    });
  } catch (error) {
    console.error("Error subiendo documento:", error);
    res.status(500).json({ error: "Error al subir documento" });
  }
};

// Listar documentos de un vehículo
export const listarDocumentos = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;

    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    const query = `
      SELECT id_documento, id_vehiculo, tipo_documento, archivo_url, fecha_carga
      FROM documento_vehiculo
      WHERE id_vehiculo = $1
      ORDER BY fecha_carga DESC
    `;

    const result = await db.query(query, [id_vehiculo]);
    res.json({ 
      total: result.rows.length, 
      documentos: result.rows 
    });
  } catch (error) {
    console.error("Error listando documentos:", error);
    res.status(500).json({ error: "Error al listar documentos" });
  }
};

// Obtener documento por ID (devuelve URL pública)
export const obtenerDocumento = async (req, res) => {
  try {
    const { id_documento } = req.params;

    if (!id_documento || isNaN(id_documento)) {
      return res.status(400).json({ error: "id_documento inválido" });
    }

    const query = `
      SELECT id_documento, id_vehiculo, tipo_documento, archivo_url, fecha_carga
      FROM documento_vehiculo
      WHERE id_documento = $1
    `;

    const result = await db.query(query, [id_documento]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo documento:", error);
    res.status(500).json({ error: "Error al obtener documento" });
  }
};

// Obtener historial del vehículo (cambios de estado, documentos, etc.)
export const obtenerHistorialVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;

    if (!id_vehiculo || isNaN(id_vehiculo)) {
      return res.status(400).json({ error: "id_vehiculo inválido" });
    }

    // Verificar que vehículo existe
    const vehiculoCheck = await db.query("SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = $1", [id_vehiculo]);
    if (vehiculoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    const vehiculoQuery = `SELECT * FROM Vehiculo WHERE id_vehiculo = $1`;
    const vehiculoResult = await db.query(vehiculoQuery, [id_vehiculo]);
    const vehiculo = vehiculoResult.rows[0];

    const documentosQuery = `
      SELECT id_documento, tipo_documento, archivo_url, fecha_carga
      FROM documento_vehiculo
      WHERE id_vehiculo = $1
      ORDER BY fecha_carga DESC
    `;
    const documentosResult = await db.query(documentosQuery, [id_vehiculo]);

    // Obtener eventos del historial del vehículo
    const historialQuery = `
      SELECT id_historial, descripcion_evento, fecha_evento
      FROM Historial_Vehiculo
      WHERE id_vehiculo = $1
      ORDER BY fecha_evento DESC
    `;
    const historialResult = await db.query(historialQuery, [id_vehiculo]);

    res.json({
      vehiculo: {
        id_vehiculo: vehiculo.id_vehiculo,
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        estado_operativo: vehiculo.estado_operativo,
        fecha_registro: vehiculo.fecha_registro
      },
      documentos: documentosResult.rows,
      total_documentos: documentosResult.rows.length,
      historial: historialResult.rows,
      total_eventos: historialResult.rows.length
    });
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

// Descargar documento (devuelve ruta del archivo)

export const descargarDocumento = async (req, res) => {
  try {
    const { id_documento } = req.params;

    if (!id_documento || isNaN(id_documento)) {
      return res.status(400).json({ error: "id_documento inválido" });
    }

    const query = `
      SELECT archivo_url
      FROM documento_vehiculo
      WHERE id_documento = $1
    `;

    const result = await db.query(query, [id_documento]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ 
      archivo_url: result.rows[0].archivo_url,
      descarga_url: `http://localhost:3000${result.rows[0].archivo_url}`
    });
  } catch (error) {
    console.error("Error descargando documento:", error);
    res.status(500).json({ error: "Error al descargar documento" });
  }
};
