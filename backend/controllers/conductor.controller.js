import { db } from "../config/db.js";

// Crear conductor
export const crearConductor = async (req, res) => {
  try {
    const { nombre, cedula, telefono, licencia_conduccion, estado } = req.body;

    if (!nombre || !cedula) {
      return res.status(400).json({ error: "Faltan campos requeridos: nombre o cedula" });
    }

    const estadoFinal = estado || 'activo';
    const estadosPermitidos = ['activo', 'inactivo'];
    if (!estadosPermitidos.includes(estadoFinal)) {
      return res.status(400).json({ error: "estado inválido" });
    }

    // Validar cedula única
    const exists = await db.query("SELECT id_conductor FROM Conductor WHERE cedula = $1", [cedula]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Cédula ya registrada" });
    }

    const query = `
      INSERT INTO Conductor (nombre, cedula, telefono, licencia_conduccion, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_conductor, nombre, cedula, telefono, licencia_conduccion, estado
    `;
    const values = [nombre, cedula, telefono || null, licencia_conduccion || null, estadoFinal];
    const result = await db.query(query, values);

    res.status(201).json({ mensaje: "Conductor creado", conductor: result.rows[0] });
  } catch (error) {
    console.error("Error creando conductor:", error);
    res.status(500).json({ error: "Error al crear conductor" });
  }
};

// Listar conductores
export const listarConductores = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id_conductor, nombre, cedula, telefono, licencia_conduccion, estado FROM Conductor ORDER BY id_conductor`
    );
    res.json({ total: result.rows.length, conductores: result.rows });
  } catch (error) {
    console.error("Error listando conductores:", error);
    res.status(500).json({ error: "Error al listar conductores" });
  }
};

// Obtener conductor por ID
export const obtenerConductor = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    const result = await db.query(
      `SELECT id_conductor, nombre, cedula, telefono, licencia_conduccion, estado FROM Conductor WHERE id_conductor = $1`,
      [id_conductor]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo conductor:", error);
    res.status(500).json({ error: "Error al obtener conductor" });
  }
};

// Actualizar conductor
export const actualizarConductor = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    const { nombre, cedula, telefono, licencia_conduccion, estado } = req.body;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    if (estado) {
      const estadosPermitidos = ['activo', 'inactivo'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ error: "estado inválido" });
      }
    }

    // Si se cambia la cédula, verificar unicidad
    if (cedula) {
      const cedulaExists = await db.query(
        "SELECT id_conductor FROM Conductor WHERE cedula = $1 AND id_conductor <> $2",
        [cedula, id_conductor]
      );
      if (cedulaExists.rows.length > 0) return res.status(409).json({ error: "Cédula ya registrada" });
    }

    const query = `
      UPDATE Conductor
      SET nombre = COALESCE($1, nombre),
          cedula = COALESCE($2, cedula),
          telefono = COALESCE($3, telefono),
          licencia_conduccion = COALESCE($4, licencia_conduccion),
          estado = COALESCE($5, estado)
      WHERE id_conductor = $6
      RETURNING id_conductor, nombre, cedula, telefono, licencia_conduccion, estado
    `;
    const values = [nombre || null, cedula || null, telefono || null, licencia_conduccion || null, estado || null, id_conductor];
    const result = await db.query(query, values);

    if (result.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });
    res.json({ mensaje: "Conductor actualizado", conductor: result.rows[0] });
  } catch (error) {
    console.error("Error actualizando conductor:", error);
    res.status(500).json({ error: "Error al actualizar conductor" });
  }
};

// Desactivar conductor
export const desactivarConductor = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    const result = await db.query(
      `UPDATE Conductor SET estado = 'inactivo' WHERE id_conductor = $1 RETURNING id_conductor, nombre, estado`,
      [id_conductor]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });
    res.json({ mensaje: "Conductor desactivado", conductor: result.rows[0] });
  } catch (error) {
    console.error("Error desactivando conductor:", error);
    res.status(500).json({ error: "Error al desactivar conductor" });
  }
};

// Activar conductor
export const activarConductor = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    const result = await db.query(
      `UPDATE Conductor SET estado = 'activo' WHERE id_conductor = $1 RETURNING id_conductor, nombre, estado`,
      [id_conductor]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });
    res.json({ mensaje: "Conductor activado", conductor: result.rows[0] });
  } catch (error) {
    console.error("Error activando conductor:", error);
    res.status(500).json({ error: "Error al activar conductor" });
  }
};

// Eliminar conductor
export const eliminarConductor = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    // Validar que no existan referencias activas
    const refs = await db.query(
      `SELECT 1 FROM Horas_Conduccion WHERE id_conductor = $1 LIMIT 1`,
      [id_conductor]
    );
    if (refs.rows.length > 0) {
      return res.status(409).json({ error: "No se puede eliminar: conductor tiene registros de horas." });
    }

    const result = await db.query(
      `DELETE FROM Conductor WHERE id_conductor = $1 RETURNING id_conductor, nombre, cedula`,
      [id_conductor]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });
    res.json({ mensaje: "Conductor eliminado", conductor: result.rows[0] });
  } catch (error) {
    console.error("Error eliminando conductor:", error);
    res.status(500).json({ error: "Error al eliminar conductor" });
  }
};

// Ver detalles del conductor (incluye horas, alertas y eventos de historial)
export const verDetallesConductor = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    // Conductor
    const conductorRes = await db.query(
      `SELECT id_conductor, nombre, cedula, telefono, licencia_conduccion, estado FROM Conductor WHERE id_conductor = $1`,
      [id_conductor]
    );
    if (conductorRes.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });
    const conductor = conductorRes.rows[0];

    // Horas de conducción
    const horasRes = await db.query(
      `SELECT id_hora, fecha, hora_inicio, hora_fin, horas_manejadas, registrado_por, observaciones FROM Horas_Conduccion WHERE id_conductor = $1 ORDER BY fecha DESC, hora_inicio DESC`,
      [id_conductor]
    );

    // Alertas de fatiga
    const alertasRes = await db.query(
      `SELECT id_alerta, fecha_alerta, descripcion FROM Alerta_Fatiga WHERE id_conductor = $1 ORDER BY fecha_alerta DESC`,
      [id_conductor]
    );

    // Historial
    const historialRes = await db.query(
      `SELECT id_historial_conductor, evento, fecha_evento FROM Historial_Conductor WHERE id_conductor = $1 ORDER BY fecha_evento DESC`,
      [id_conductor]
    );

    res.json({
      conductor,
      horas_conduccion: horasRes.rows,
      total_horas: horasRes.rows.length,
      alertas: alertasRes.rows,
      total_alertas: alertasRes.rows.length,
      historial: historialRes.rows,
      total_eventos: historialRes.rows.length
    });
  } catch (error) {
    console.error("Error obteniendo detalles del conductor:", error);
    res.status(500).json({ error: "Error al obtener detalles del conductor" });
  }
};

// Historial conductor (solo eventos)
export const obtenerHistorialConductor = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    const result = await db.query(
      `SELECT id_historial_conductor, evento, fecha_evento FROM Historial_Conductor WHERE id_conductor = $1 ORDER BY fecha_evento DESC`,
      [id_conductor]
    );

    res.json({ total: result.rows.length, historial: result.rows });
  } catch (error) {
    console.error("Error obteniendo historial conductor:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

// Registrar horas de conducción
export const registrarHorasConduccion = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    const { fecha, hora_inicio, hora_fin, horas_manejadas, observaciones } = req.body;

    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });
    if (!fecha || !hora_inicio || !hora_fin || horas_manejadas == null) return res.status(400).json({ error: "Faltan campos requeridos" });

    // Verificar conductor existe
    const c = await db.query("SELECT id_conductor FROM Conductor WHERE id_conductor = $1", [id_conductor]);
    if (c.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });

    const query = `
      INSERT INTO Horas_Conduccion (id_conductor, fecha, hora_inicio, hora_fin, horas_manejadas, registrado_por, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_hora, id_conductor, fecha, hora_inicio, hora_fin, horas_manejadas, registrado_por, observaciones
    `;
    const values = [
      id_conductor,
      fecha,
      hora_inicio,
      hora_fin,
      horas_manejadas,
      // Registrar siempre al usuario autenticado; si no hay, dejar null
      req.usuario?.id_usuario || null,
      observaciones || null
    ];
    const result = await db.query(query, values);

    // Registrar evento en historial
    try {
      const evento = `Registro de horas: ${horas_manejadas} horas en ${fecha}`;
      await db.query(
        `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_conductor, evento]
      );
    } catch (histErr) {
      console.error('Error registrando historial conductor:', histErr);
    }

    // Monitoreo de fatiga: sumar horas del mismo día y lanzar alerta si supera umbral
    try {
      const threshold = parseFloat(process.env.FATIGA_THRESHOLD_HORAS) || 8; // horas por defecto
      const totalQuery = `
        SELECT COALESCE(SUM(horas_manejadas), 0) AS total_horas
        FROM Horas_Conduccion
        WHERE id_conductor = $1 AND fecha = $2
      `;
      const totalRes = await db.query(totalQuery, [id_conductor, fecha]);
      const totalHoras = parseFloat(totalRes.rows[0].total_horas) || 0;

      let alerta = null;
      if (totalHoras > threshold) {
        // Crear alerta de fatiga
        const descripcion = `Superó el límite de ${threshold} horas: total ${totalHoras}h en ${fecha}`;
        const alertaRes = await db.query(
          `INSERT INTO Alerta_Fatiga (id_conductor, fecha_alerta, descripcion) VALUES ($1, CURRENT_TIMESTAMP, $2) RETURNING id_alerta, fecha_alerta, descripcion`,
          [id_conductor, descripcion]
        );

        // Registrar en historial del conductor
        try {
          const eventoAlerta = `Alerta de fatiga automática: ${descripcion}`;
          await db.query(
            `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [id_conductor, eventoAlerta]
          );
        } catch (histErr2) {
          console.error('Error registrando historial por alerta:', histErr2);
        }

        // Desactivar conductor por normativa/seguridad
        try {
          await db.query(`UPDATE Conductor SET estado = 'inactivo' WHERE id_conductor = $1`, [id_conductor]);
          // Registrar evento de desactivación en historial
          await db.query(
            `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [id_conductor, `Conductor desactivado automáticamente por alerta de fatiga: ${descripcion}`]
          );
        } catch (deactErr) {
          console.error('Error desactivando conductor tras alerta:', deactErr);
        }

        alerta = alertaRes.rows[0];
      }

      res.status(201).json({ mensaje: "Horas registradas", registro: result.rows[0], total_horas_dia: totalHoras, alerta_fatiga: alerta });
    } catch (monitorErr) {
      console.error('Error monitoreando fatiga:', monitorErr);
      // Responder sin alerta si falla el monitoreo
      res.status(201).json({ mensaje: "Horas registradas", registro: result.rows[0] });
    }
  } catch (error) {
    console.error("Error registrando horas:", error);
    res.status(500).json({ error: "Error al registrar horas de conducción" });
  }
};

// Registrar alerta de fatiga
export const registrarAlertaFatiga = async (req, res) => {
  try {
    const { id_conductor } = req.params;
    const { descripcion } = req.body;

    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });
    if (!descripcion) return res.status(400).json({ error: "descripcion es requerida" });

    // Verificar conductor existe
    const c = await db.query("SELECT id_conductor FROM Conductor WHERE id_conductor = $1", [id_conductor]);
    if (c.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });

    const result = await db.query(
      `INSERT INTO Alerta_Fatiga (id_conductor, fecha_alerta, descripcion) VALUES ($1, CURRENT_TIMESTAMP, $2) RETURNING id_alerta, fecha_alerta, descripcion`,
      [id_conductor, descripcion]
    );

    // Registrar en historial
    try {
      const evento = `Alerta de fatiga: ${descripcion}`;
      await db.query(
        `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_conductor, evento]
      );
    } catch (histErr) {
      console.error('Error registrando historial conductor (alerta):', histErr);
    }

    res.status(201).json({ mensaje: "Alerta registrada", alerta: result.rows[0] });
  } catch (error) {
    console.error("Error registrando alerta:", error);
    res.status(500).json({ error: "Error al registrar alerta" });
  }
};
