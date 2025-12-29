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

// Listar conductores en ventana de fatiga activa
export const listarConductoresFatigaActiva = async (_req, res) => {
  try {
    const threshold = parseFloat(process.env.FATIGA_THRESHOLD_HORAS) || 8; // horas por defecto
    const descansoHoras = 6;

    const query = `
      SELECT c.id_conductor, c.nombre, lh.fecha, lh.hora_fin,
             (SELECT COALESCE(SUM(h2.horas_manejadas), 0)
              FROM Horas_Conduccion h2
              WHERE h2.id_conductor = c.id_conductor AND h2.fecha = lh.fecha) AS total_horas_dia
      FROM Conductor c
      JOIN LATERAL (
        SELECT h.fecha, h.hora_fin, h.horas_manejadas
        FROM Horas_Conduccion h
        WHERE h.id_conductor = c.id_conductor
        ORDER BY h.fecha DESC, h.hora_fin DESC
        LIMIT 1
      ) AS lh ON TRUE
    `;

    const { rows } = await db.query(query);
    const now = new Date();

    const conductores = rows
      .map((r) => {
        if (!r?.hora_fin || !r?.fecha) return null;
        const fechaStr = r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha).split('T')[0];
        const finDate = fechaStr ? new Date(`${fechaStr}T${r.hora_fin}`) : new Date(`${r.fecha} ${r.hora_fin}`);
        if (Number.isNaN(finDate.getTime())) return null;

        const descansoHasta = new Date(finDate.getTime() + descansoHoras * 60 * 60 * 1000);
        const totalHorasDia = parseFloat(r.total_horas_dia) || 0;
        const fatigaActiva = totalHorasDia > threshold && descansoHasta > now;
        if (!fatigaActiva) return null;

        return {
          id_conductor: r.id_conductor,
          nombre: r.nombre,
          fecha: r.fecha,
          hora_fin: r.hora_fin,
          total_horas_dia: totalHorasDia,
          descanso_inicio: finDate.toISOString(),
          descanso_hasta: descansoHasta.toISOString(),
          fatiga_activa: true,
          restante_ms: Math.max(descansoHasta.getTime() - now.getTime(), 0)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.restante_ms - b.restante_ms);

    res.json({ total: conductores.length, conductores });
  } catch (error) {
    console.error('Error listando fatiga activa:', error);
    res.status(500).json({ error: 'Error al listar conductores con fatiga activa' });
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
  const client = await db.connect();
  let txOpen = false;

  try {
    const { id_conductor } = req.params;
    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });

    await client.query("BEGIN");
    txOpen = true;

    // Limpiar asignaciones de trayectos
    await client.query(`DELETE FROM Vehiculo_Conductor_Trayecto WHERE id_conductor = $1`, [id_conductor]);
    await client.query(`DELETE FROM Conductor_Trayecto WHERE id_conductor = $1`, [id_conductor]);

    // Limpiar registros de horas, alertas de fatiga e historial
    await client.query(`DELETE FROM Horas_Conduccion WHERE id_conductor = $1`, [id_conductor]);
    await client.query(`DELETE FROM Alerta_Fatiga WHERE id_conductor = $1`, [id_conductor]);
    await client.query(`DELETE FROM Historial_Conductor WHERE id_conductor = $1`, [id_conductor]);

    const result = await client.query(
      `DELETE FROM Conductor WHERE id_conductor = $1 RETURNING id_conductor, nombre, cedula`,
      [id_conductor]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      txOpen = false;
      return res.status(404).json({ error: "Conductor no encontrado" });
    }

    await client.query("COMMIT");
    txOpen = false;
    res.json({ mensaje: "Conductor eliminado", conductor: result.rows[0] });
  } catch (error) {
    if (txOpen) {
      try { await client.query("ROLLBACK"); } catch (_) {}
    }
    console.error("Error eliminando conductor:", error);
    res.status(500).json({ error: error?.message || "Error al eliminar conductor" });
  } finally {
    client.release();
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
    const { fecha, hora_inicio, hora_fin, observaciones } = req.body;

    if (!id_conductor || isNaN(id_conductor)) return res.status(400).json({ error: "id_conductor inválido" });
    if (!fecha || !hora_inicio || !hora_fin) return res.status(400).json({ error: "Faltan campos requeridos" });

    // Verificar conductor existe
    const c = await db.query("SELECT id_conductor FROM Conductor WHERE id_conductor = $1", [id_conductor]);
    if (c.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });

    // Calcular horas en backend (evita depender del cliente)
    const parseHm = (hm) => {
      if (!hm || !hm.includes(":")) return null;
      const [h, m] = hm.split(":").map((v) => Number(v));
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
      return h * 60 + m;
    };
    const minutos = (parseHm(hora_fin) ?? 0) - (parseHm(hora_inicio) ?? 0);
    const horasCalculadas = Math.max(minutos / 60, 0);

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
      horasCalculadas,
      req.usuario?.id_usuario || null,
      observaciones || null
    ];
    const result = await db.query(query, values);

    // Registrar evento en historial (no bloquear si falla)
    try {
      const evento = `Registro de horas: ${horasCalculadas.toFixed(2)} horas en ${fecha}`;
      await db.query(
        `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_conductor, evento]
      );
    } catch (histErr) {
      console.error('Error registrando historial conductor:', histErr);
    }

    // Monitoreo de fatiga: sumar horas del mismo día y determinar ventana de descanso
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
      let descansoHasta = null;
      let fatigaActiva = false;

      if (totalHoras > threshold) {
        // Crear alerta de fatiga (solo registro, no cambia estado)
        const descripcion = `Superó el límite de ${threshold} horas: total ${totalHoras}h en ${fecha}`;
        const alertaRes = await db.query(
          `INSERT INTO Alerta_Fatiga (id_conductor, fecha_alerta, descripcion) VALUES ($1, CURRENT_TIMESTAMP, $2) RETURNING id_alerta, fecha_alerta, descripcion`,
          [id_conductor, descripcion]
        );
        alerta = alertaRes.rows[0];

        // Calcular descanso mínimo: hora_fin + 6h (derivado, sin persistir)
        const finDate = new Date(`${fecha}T${hora_fin}`);
        descansoHasta = new Date(finDate.getTime() + 6 * 60 * 60 * 1000);
        fatigaActiva = descansoHasta > new Date();

        // Registrar en historial el descanso estimado
        try {
          const eventoAlerta = `Alerta de fatiga automática: ${descripcion}. Descanso hasta ${descansoHasta.toISOString()}`;
          await db.query(
            `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [id_conductor, eventoAlerta]
          );
        } catch (histErr2) {
          console.error('Error registrando historial por alerta:', histErr2);
        }
      }

      res.status(201).json({
        mensaje: "Horas registradas",
        registro: result.rows[0],
        total_horas_dia: totalHoras,
        alerta_fatiga: alerta,
        descanso_hasta: descansoHasta ? descansoHasta.toISOString() : null,
        fatiga_activa: fatigaActiva
      });
    } catch (monitorErr) {
      console.error('Error monitoreando fatiga:', monitorErr);
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
