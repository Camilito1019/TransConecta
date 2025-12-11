import { db } from "../config/db.js";

// Asignar trayecto a vehículo y conductor
export const asignarTrayecto = async (req, res) => {
  const client = await db.connect();

  try {
    const { id_vehiculo, id_conductor, id_trayecto, id_cliente } = req.body;

    if (!id_vehiculo || !id_conductor || !id_trayecto || !id_cliente) {
      return res.status(400).json({ error: "Faltan campos: id_vehiculo, id_conductor, id_trayecto, id_cliente" });
    }

    if ([id_vehiculo, id_conductor, id_trayecto, id_cliente].some((v) => isNaN(Number(v)))) {
      return res.status(400).json({ error: "id_vehiculo, id_conductor, id_trayecto e id_cliente deben ser numéricos" });
    }

    await client.query("BEGIN");

    // Verificar que existen vehiculo, conductor y trayecto
    const vehiculo = await client.query("SELECT id_vehiculo, estado_operativo FROM Vehiculo WHERE id_vehiculo = $1", [id_vehiculo]);
    if (vehiculo.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    if ((vehiculo.rows[0].estado_operativo || "").toLowerCase() !== "operativo") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El vehículo no está operativo y no puede ser asignado" });
    }

    const conductor = await client.query("SELECT id_conductor FROM Conductor WHERE id_conductor = $1", [id_conductor]);
    if (conductor.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Conductor no encontrado" });
    }

    // Validar fatiga: bloquear si tiene alertas en últimas 24h
    const alertaFatiga = await client.query(
      `SELECT fecha_alerta FROM Alerta_Fatiga 
       WHERE id_conductor = $1 AND fecha_alerta >= (CURRENT_TIMESTAMP - INTERVAL '24 hours')
       ORDER BY fecha_alerta DESC LIMIT 1`,
      [id_conductor]
    );
    if (alertaFatiga.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El conductor tiene alerta de fatiga reciente y no puede ser asignado" });
    }

    // Validar que el conductor no tenga un trayecto activo en Conductor_Trayecto
    const conductorOcupado = await client.query(
      `SELECT 1 FROM Conductor_Trayecto WHERE id_conductor = $1 LIMIT 1`,
      [id_conductor]
    );
    if (conductorOcupado.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El conductor ya tiene un trayecto asignado" });
    }

    // Validar que el vehículo no tenga asignación activa
    const vehiculoOcupado = await client.query(
      `SELECT 1 FROM Vehiculo_Conductor_Trayecto WHERE id_vehiculo = $1 LIMIT 1`,
      [id_vehiculo]
    );
    if (vehiculoOcupado.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El vehículo ya tiene un trayecto asignado" });
    }

    const trayecto = await client.query("SELECT id_trayecto FROM Trayecto WHERE id_trayecto = $1", [id_trayecto]);
    if (trayecto.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Trayecto no encontrado" });
    }

    const clienteRes = await client.query("SELECT estado FROM Cliente WHERE id_cliente = $1", [id_cliente]);
    if (clienteRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    if ((clienteRes.rows[0].estado || "").toLowerCase() !== "activo") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El cliente está inactivo" });
    }

    // Insertar en Conductor_Trayecto
    const conductorTrayectoRes = await client.query(
      `INSERT INTO Conductor_Trayecto (id_conductor, id_trayecto, fecha_asignacion)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING id_conductor_trayecto, id_conductor, id_trayecto, fecha_asignacion`,
      [id_conductor, id_trayecto]
    );

    // Insertar en Vehiculo_Conductor_Trayecto
    const vehiculoTrayectoRes = await client.query(
      `INSERT INTO Vehiculo_Conductor_Trayecto (id_vehiculo, id_conductor, id_trayecto, id_cliente, fecha_asignacion, registrado_por)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
       RETURNING id_asignacion, id_vehiculo, id_conductor, id_trayecto, id_cliente, fecha_asignacion, registrado_por`,
      [id_vehiculo, id_conductor, id_trayecto, id_cliente, req.usuario?.id_usuario || null]
    );

    // Actualizar estado del conductor a "en_ruta"
    try {
      await client.query("UPDATE Conductor SET estado = 'en_ruta' WHERE id_conductor = $1", [id_conductor]);
      await client.query(
        `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_conductor, `Asignado a trayecto ${id_trayecto} en vehículo ${id_vehiculo}`]
      );
    } catch (histErr) {
      console.error("Error actualizando historial conductor:", histErr);
    }

    // Actualizar estado del vehículo a "en_ruta"
    try {
      await client.query("UPDATE Vehiculo SET estado_operativo = 'en_ruta' WHERE id_vehiculo = $1", [id_vehiculo]);
      await client.query(
        `INSERT INTO Historial_Vehiculo (id_vehiculo, descripcion_evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_vehiculo, `Asignado a trayecto ${id_trayecto} con conductor ${id_conductor}`]
      );
    } catch (histErr) {
      console.error("Error actualizando historial vehículo:", histErr);
    }

    await client.query("COMMIT");

    res.status(201).json({
      mensaje: "Trayecto asignado exitosamente",
      asignacion: vehiculoTrayectoRes.rows[0],
      conductor_trayecto: conductorTrayectoRes.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error asignando trayecto:", error);
    res.status(500).json({ error: "Error al asignar trayecto" });
  } finally {
    client.release();
  }
};

// Actualizar una asignación existente
export const actualizarAsignacion = async (req, res) => {
  const { id_asignacion } = req.params;
  const { id_vehiculo, id_conductor, id_trayecto, id_cliente } = req.body;

  if (!id_asignacion || isNaN(id_asignacion)) {
    return res.status(400).json({ error: "id_asignacion inválido" });
  }

  if (!id_vehiculo || !id_conductor || !id_trayecto || !id_cliente) {
    return res.status(400).json({ error: "Faltan campos: id_vehiculo, id_conductor, id_trayecto, id_cliente" });
  }

  if ([id_vehiculo, id_conductor, id_trayecto, id_cliente].some((v) => isNaN(Number(v)))) {
    return res.status(400).json({ error: "id_vehiculo, id_conductor, id_trayecto e id_cliente deben ser numéricos" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const asignacionActual = await client.query(
      `SELECT id_vehiculo, id_conductor, id_trayecto, id_cliente FROM Vehiculo_Conductor_Trayecto WHERE id_asignacion = $1`,
      [id_asignacion]
    );

    if (asignacionActual.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Asignación no encontrada" });
    }

    const actual = asignacionActual.rows[0];

    // Validar existencia de nuevos registros
    const vehiculo = await client.query("SELECT estado_operativo FROM Vehiculo WHERE id_vehiculo = $1", [id_vehiculo]);
    if (vehiculo.rows.length === 0) throw new Error("Vehículo no encontrado");
    if ((vehiculo.rows[0].estado_operativo || "").toLowerCase() !== "operativo") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El vehículo no está operativo y no puede ser asignado" });
    }

    const conductor = await client.query("SELECT 1 FROM Conductor WHERE id_conductor = $1", [id_conductor]);
    if (conductor.rows.length === 0) throw new Error("Conductor no encontrado");

    // Validar fatiga para el nuevo conductor (últimas 24h)
    const alertaFatiga = await client.query(
      `SELECT fecha_alerta FROM Alerta_Fatiga 
       WHERE id_conductor = $1 AND fecha_alerta >= (CURRENT_TIMESTAMP - INTERVAL '24 hours')
       ORDER BY fecha_alerta DESC LIMIT 1`,
      [id_conductor]
    );
    if (alertaFatiga.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El conductor tiene alerta de fatiga reciente y no puede ser asignado" });
    }

    // Validar que el conductor no tenga otro trayecto activo en Conductor_Trayecto
    const conductorOcupado = await client.query(
      `SELECT 1 FROM Conductor_Trayecto
       WHERE id_conductor = $1
         AND NOT (id_conductor = $2 AND id_trayecto = $3)
       LIMIT 1`,
      [id_conductor, actual.id_conductor, actual.id_trayecto]
    );
    if (conductorOcupado.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El conductor ya tiene un trayecto asignado" });
    }

    // Validar que el nuevo vehículo no tenga asignación activa
    const vehiculoOcupado = await client.query(
      `SELECT 1 FROM Vehiculo_Conductor_Trayecto WHERE id_vehiculo = $1 AND id_asignacion <> $2 LIMIT 1`,
      [id_vehiculo, id_asignacion]
    );
    if (vehiculoOcupado.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El vehículo ya tiene un trayecto asignado" });
    }

    const trayecto = await client.query("SELECT 1 FROM Trayecto WHERE id_trayecto = $1", [id_trayecto]);
    if (trayecto.rows.length === 0) throw new Error("Trayecto no encontrado");

    const clienteRes = await client.query("SELECT estado FROM Cliente WHERE id_cliente = $1", [id_cliente]);
    if (clienteRes.rows.length === 0) throw new Error("Cliente no encontrado");
    if ((clienteRes.rows[0].estado || "").toLowerCase() !== "activo") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "El cliente está inactivo" });
    }

    const cambioConductorTrayecto =
      Number(actual.id_conductor) !== Number(id_conductor) || Number(actual.id_trayecto) !== Number(id_trayecto);

    if (cambioConductorTrayecto) {
      await client.query("DELETE FROM Conductor_Trayecto WHERE id_conductor = $1 AND id_trayecto = $2", [
        actual.id_conductor,
        actual.id_trayecto,
      ]);

      await client.query(
        `INSERT INTO Conductor_Trayecto (id_conductor, id_trayecto, fecha_asignacion)
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_conductor, id_trayecto]
      );
    }

    const updateRes = await client.query(
        `UPDATE Vehiculo_Conductor_Trayecto
         SET id_vehiculo = $1,
           id_conductor = $2,
           id_trayecto = $3,
           id_cliente = $4,
           fecha_asignacion = CURRENT_TIMESTAMP,
           registrado_por = $5
         WHERE id_asignacion = $6
         RETURNING id_asignacion, id_vehiculo, id_conductor, id_trayecto, id_cliente, fecha_asignacion, registrado_por`,
        [id_vehiculo, id_conductor, id_trayecto, id_cliente, req.usuario?.id_usuario || null, id_asignacion]
    );

    // Actualizar estados para el conductor/vehículo anterior si ya no tienen asignaciones
    if (Number(actual.id_conductor) !== Number(id_conductor)) {
      const otrasAsignConductor = await client.query(
        `SELECT 1 FROM Vehiculo_Conductor_Trayecto WHERE id_conductor = $1 AND id_asignacion <> $2 LIMIT 1`,
        [actual.id_conductor, id_asignacion]
      );
      if (otrasAsignConductor.rows.length === 0) {
        await client.query("UPDATE Conductor SET estado = 'activo' WHERE id_conductor = $1", [actual.id_conductor]);
        await client.query(
          `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
          [actual.id_conductor, `Reasignado desde trayecto ${actual.id_trayecto}`]
        );
      }
    }

    if (Number(actual.id_vehiculo) !== Number(id_vehiculo)) {
      const otrasAsignVehiculo = await client.query(
        `SELECT 1 FROM Vehiculo_Conductor_Trayecto WHERE id_vehiculo = $1 AND id_asignacion <> $2 LIMIT 1`,
        [actual.id_vehiculo, id_asignacion]
      );
      if (otrasAsignVehiculo.rows.length === 0) {
        await client.query(
          "UPDATE Vehiculo SET estado_operativo = 'operativo' WHERE id_vehiculo = $1",
          [actual.id_vehiculo]
        );
        await client.query(
          `INSERT INTO Historial_Vehiculo (id_vehiculo, descripcion_evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
          [actual.id_vehiculo, `Reasignado desde trayecto ${actual.id_trayecto}`]
        );
      }
    }

    // Estados e historial para nuevos recursos
    await client.query("UPDATE Conductor SET estado = 'en_ruta' WHERE id_conductor = $1", [id_conductor]);
    await client.query(
      `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [id_conductor, `Asignado al trayecto ${id_trayecto} con vehículo ${id_vehiculo}`]
    );

    await client.query("UPDATE Vehiculo SET estado_operativo = 'en_ruta' WHERE id_vehiculo = $1", [id_vehiculo]);
    await client.query(
      `INSERT INTO Historial_Vehiculo (id_vehiculo, descripcion_evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [id_vehiculo, `Asignado al trayecto ${id_trayecto} con conductor ${id_conductor}`]
    );

    await client.query("COMMIT");

    res.json({ mensaje: "Asignación actualizada", asignacion: updateRes.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    const msg = error.message || "Error al actualizar asignación";
    console.error("Error actualizando asignación:", error);
    res.status(msg.includes("no encontrado") ? 404 : 500).json({ error: msg });
  } finally {
    client.release();
  }
};

// Listar trayectos disponibles
export const listarTrayectos = async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT t.id_trayecto,
              t.origen,
              t.destino,
              t.distancia_km,
              t.tiempo_estimado
       FROM Trayecto t
       ORDER BY t.id_trayecto`
    );
    res.json({ total: result.rows.length, trayectos: result.rows });
  } catch (error) {
    console.error("Error listando trayectos:", error);
    res.status(500).json({ error: "Error al listar trayectos" });
  }
};

// Ver trayecto asignado (detalles completos: vehículo, conductor, trayecto)
export const verTrayectoAsignado = async (req, res) => {
  try {
    const { id_asignacion } = req.params;
    if (!id_asignacion || isNaN(id_asignacion)) return res.status(400).json({ error: "id_asignacion inválido" });

    // Obtener detalles de la asignación
    const asignRes = await db.query(
      `SELECT id_asignacion, id_vehiculo, id_conductor, id_trayecto, id_cliente, fecha_asignacion
       FROM Vehiculo_Conductor_Trayecto WHERE id_asignacion = $1`,
      [id_asignacion]
    );

    if (asignRes.rows.length === 0) return res.status(404).json({ error: "Asignación no encontrada" });

    const asign = asignRes.rows[0];

    // Obtener detalles del vehículo
    const vehiculoRes = await db.query(
      `SELECT id_vehiculo, placa, marca, modelo, estado_operativo FROM Vehiculo WHERE id_vehiculo = $1`,
      [asign.id_vehiculo]
    );

    // Obtener detalles del conductor
    const conductorRes = await db.query(
      `SELECT id_conductor, nombre, cedula, estado FROM Conductor WHERE id_conductor = $1`,
      [asign.id_conductor]
    );

    // Obtener detalles del trayecto
    const trayectoRes = await db.query(
      `SELECT id_trayecto, origen, destino, distancia_km, tiempo_estimado
       FROM Trayecto WHERE id_trayecto = $1`,
      [asign.id_trayecto]
    );

    let cliente = null;
    if (asign.id_cliente) {
      const clienteRes = await db.query(
        `SELECT id_cliente, nombre, telefono, estado FROM Cliente WHERE id_cliente = $1`,
        [asign.id_cliente]
      );
      cliente = clienteRes.rows[0] || null;
    }

    res.json({
      asignacion: asign,
      vehiculo: vehiculoRes.rows[0] || null,
      conductor: conductorRes.rows[0] || null,
      trayecto: trayectoRes.rows[0] || null,
      cliente
    });
  } catch (error) {
    console.error("Error obteniendo trayecto asignado:", error);
    res.status(500).json({ error: "Error al obtener trayecto asignado" });
  }
};

// Actualizar trayecto (origen, destino, distancia, tiempo)
export const actualizarTrayecto = async (req, res) => {
  try {
    const { id_trayecto } = req.params;
    const { origen, destino, distancia_km, tiempo_estimado } = req.body;

    if (!id_trayecto || isNaN(id_trayecto)) return res.status(400).json({ error: "id_trayecto inválido" });

    const distanciaVal = distancia_km !== undefined && distancia_km !== null ? Number(distancia_km) : null;
    const tiempoVal = tiempo_estimado !== undefined && tiempo_estimado !== null ? Number(tiempo_estimado) : null;
    if (distanciaVal !== null && (Number.isNaN(distanciaVal) || distanciaVal <= 0)) {
      return res.status(400).json({ error: "distancia_km debe ser numérica y mayor a 0" });
    }
    if (tiempoVal !== null && (Number.isNaN(tiempoVal) || tiempoVal <= 0)) {
      return res.status(400).json({ error: "tiempo_estimado debe ser numérico y mayor a 0" });
    }

    const actualRes = await db.query(
      "SELECT id_trayecto FROM Trayecto WHERE id_trayecto = $1",
      [id_trayecto]
    );
    if (actualRes.rows.length === 0) {
      return res.status(404).json({ error: "Trayecto no encontrado" });
    }

    const query = `
      UPDATE Trayecto
      SET origen = COALESCE($1, origen),
          destino = COALESCE($2, destino),
          distancia_km = COALESCE($3, distancia_km),
          tiempo_estimado = COALESCE($4, tiempo_estimado)
      WHERE id_trayecto = $5
      RETURNING id_trayecto, origen, destino, distancia_km, tiempo_estimado
    `;

    const values = [origen || null, destino || null, distanciaVal, tiempoVal, id_trayecto];
    const result = await db.query(query, values);

    res.json({ mensaje: "Trayecto actualizado", trayecto: result.rows[0] });
  } catch (error) {
    console.error("Error actualizando trayecto:", error);
    res.status(500).json({ error: "Error al actualizar trayecto" });
  }
};

// Desasignar trayecto (eliminar la asignación)
export const desasignarTrayecto = async (req, res) => {
  try {
    const { id_asignacion } = req.params;
    if (!id_asignacion || isNaN(id_asignacion)) return res.status(400).json({ error: "id_asignacion inválido" });

    // Obtener detalles antes de desasignar
    const asignRes = await db.query(
      `SELECT id_vehiculo, id_conductor, id_trayecto FROM Vehiculo_Conductor_Trayecto WHERE id_asignacion = $1`,
      [id_asignacion]
    );

    if (asignRes.rows.length === 0) return res.status(404).json({ error: "Asignación no encontrada" });

    const { id_vehiculo, id_conductor, id_trayecto } = asignRes.rows[0];

    // Eliminar de Vehiculo_Conductor_Trayecto
    await db.query("DELETE FROM Vehiculo_Conductor_Trayecto WHERE id_asignacion = $1", [id_asignacion]);

    // Eliminar de Conductor_Trayecto
    await db.query("DELETE FROM Conductor_Trayecto WHERE id_conductor = $1 AND id_trayecto = $2", [id_conductor, id_trayecto]);

    // Actualizar estado del conductor a "activo"
    try {
      await db.query("UPDATE Conductor SET estado = 'activo' WHERE id_conductor = $1", [id_conductor]);
      await db.query(
        `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_conductor, `Desasignado de trayecto ${id_trayecto}`]
      );
    } catch (histErr) {
      console.error("Error actualizando historial conductor:", histErr);
    }

    // Actualizar estado del vehículo a "operativo"
    try {
      await db.query("UPDATE Vehiculo SET estado_operativo = 'operativo' WHERE id_vehiculo = $1", [id_vehiculo]);
      await db.query(
        `INSERT INTO Historial_Vehiculo (id_vehiculo, descripcion_evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_vehiculo, `Desasignado de trayecto ${id_trayecto}`]
      );
    } catch (histErr) {
      console.error("Error actualizando historial vehículo:", histErr);
    }

    res.json({ mensaje: "Trayecto desasignado", id_asignacion, id_vehiculo, id_conductor, id_trayecto });
  } catch (error) {
    console.error("Error desasignando trayecto:", error);
    res.status(500).json({ error: "Error al desasignar trayecto" });
  }
};

// Listar todas las asignaciones activas
export const listarAsignaciones = async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        vct.id_asignacion,
        vct.id_vehiculo,
        vct.id_conductor,
        vct.id_trayecto,
        vct.id_cliente,
        vct.fecha_asignacion,
        v.placa AS vehiculo_placa,
        v.marca AS vehiculo_marca,
        v.modelo AS vehiculo_modelo,
        c.nombre AS conductor_nombre,
        c.cedula AS conductor_cedula,
        t.origen AS trayecto_origen,
        t.destino AS trayecto_destino,
        t.distancia_km,
        t.tiempo_estimado,
        cli.nombre AS cliente_nombre,
        'en_ruta' AS estado
      FROM Vehiculo_Conductor_Trayecto vct
      LEFT JOIN Vehiculo v ON v.id_vehiculo = vct.id_vehiculo
      LEFT JOIN Conductor c ON c.id_conductor = vct.id_conductor
      LEFT JOIN Trayecto t ON t.id_trayecto = vct.id_trayecto
      LEFT JOIN Cliente cli ON cli.id_cliente = vct.id_cliente
      ORDER BY vct.fecha_asignacion DESC`
    );
    res.json({ total: result.rows.length, asignaciones: result.rows });
  } catch (error) {
    console.error("Error listando asignaciones:", error);
    res.status(500).json({ error: "Error al listar asignaciones" });
  }
};

// Crear trayecto
export const crearTrayecto = async (req, res) => {
  try {
    const { origen, destino, distancia_km, tiempo_estimado } = req.body;

    if (!origen || !destino || distancia_km == null || tiempo_estimado == null) {
      return res.status(400).json({ error: "Faltan campos: origen, destino, distancia_km, tiempo_estimado" });
    }

    const distanciaVal = Number(distancia_km);
    const tiempoVal = Number(tiempo_estimado);
    if (Number.isNaN(distanciaVal) || distanciaVal <= 0) {
      return res.status(400).json({ error: "distancia_km debe ser numérica y mayor a 0" });
    }
    if (Number.isNaN(tiempoVal) || tiempoVal <= 0) {
      return res.status(400).json({ error: "tiempo_estimado debe ser numérico y mayor a 0" });
    }

    const result = await db.query(
      `INSERT INTO Trayecto (origen, destino, distancia_km, tiempo_estimado)
       VALUES ($1, $2, $3, $4)
       RETURNING id_trayecto, origen, destino, distancia_km, tiempo_estimado`,
      [origen, destino, distanciaVal, tiempoVal]
    );

    res.status(201).json({ mensaje: "Trayecto creado", trayecto: result.rows[0] });
  } catch (error) {
    console.error("Error creando trayecto:", error);
    res.status(500).json({ error: "Error al crear trayecto" });
  }
};

// Eliminar trayecto
export const eliminarTrayecto = async (req, res) => {
  try {
    const { id_trayecto } = req.params;
    if (!id_trayecto || isNaN(id_trayecto)) return res.status(400).json({ error: "id_trayecto inválido" });

    // Evitar borrar si hay asignaciones activas
    const refs = await db.query(
      `SELECT 1 FROM Vehiculo_Conductor_Trayecto WHERE id_trayecto = $1 LIMIT 1`,
      [id_trayecto]
    );
    if (refs.rows.length > 0) {
      return res.status(409).json({ error: "No se puede eliminar: trayecto tiene asignaciones." });
    }

    const result = await db.query(
      `DELETE FROM Trayecto WHERE id_trayecto = $1 RETURNING id_trayecto, origen, destino`,
      [id_trayecto]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Trayecto no encontrado" });

    res.json({ mensaje: "Trayecto eliminado", trayecto: result.rows[0] });
  } catch (error) {
    console.error("Error eliminando trayecto:", error);
    res.status(500).json({ error: "Error al eliminar trayecto" });
  }
};
