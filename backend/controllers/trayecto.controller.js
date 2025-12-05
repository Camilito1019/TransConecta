import { db } from "../config/db.js";

// Asignar trayecto a vehículo y conductor
export const asignarTrayecto = async (req, res) => {
  try {
    const { id_vehiculo, id_conductor, id_trayecto } = req.body;

    if (!id_vehiculo || !id_conductor || !id_trayecto) {
      return res.status(400).json({ error: "Faltan campos: id_vehiculo, id_conductor, id_trayecto" });
    }

    // Verificar que existen vehiculo, conductor y trayecto
    const vehiculo = await db.query("SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = $1", [id_vehiculo]);
    if (vehiculo.rows.length === 0) return res.status(404).json({ error: "Vehículo no encontrado" });

    const conductor = await db.query("SELECT id_conductor FROM Conductor WHERE id_conductor = $1", [id_conductor]);
    if (conductor.rows.length === 0) return res.status(404).json({ error: "Conductor no encontrado" });

    const trayecto = await db.query("SELECT id_trayecto FROM Trayecto WHERE id_trayecto = $1", [id_trayecto]);
    if (trayecto.rows.length === 0) return res.status(404).json({ error: "Trayecto no encontrado" });

    // Insertar en Conductor_Trayecto
    const conductorTrayectoRes = await db.query(
      `INSERT INTO Conductor_Trayecto (id_conductor, id_trayecto, fecha_asignacion) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id_conductor_trayecto, id_conductor, id_trayecto, fecha_asignacion`,
      [id_conductor, id_trayecto]
    );

    // Insertar en Vehiculo_Conductor_Trayecto
    const vehiculoTrayectoRes = await db.query(
      `INSERT INTO Vehiculo_Conductor_Trayecto (id_vehiculo, id_conductor, id_trayecto, fecha_asignacion) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id_asignacion, id_vehiculo, id_conductor, id_trayecto, fecha_asignacion`,
      [id_vehiculo, id_conductor, id_trayecto]
    );

    // Actualizar estado del conductor a "en_ruta"
    try {
      await db.query("UPDATE Conductor SET estado = 'en_ruta' WHERE id_conductor = $1", [id_conductor]);
      // Registrar en historial conductor
      await db.query(
        `INSERT INTO Historial_Conductor (id_conductor, evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_conductor, `Asignado a trayecto ${id_trayecto} en vehículo ${id_vehiculo}`]
      );
    } catch (histErr) {
      console.error("Error actualizando historial conductor:", histErr);
    }

    // Actualizar estado del vehículo a "en_ruta"
    try {
      await db.query("UPDATE Vehiculo SET estado_operativo = 'en_ruta' WHERE id_vehiculo = $1", [id_vehiculo]);
      // Registrar en historial vehículo
      await db.query(
        `INSERT INTO Historial_Vehiculo (id_vehiculo, descripcion_evento, fecha_evento) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [id_vehiculo, `Asignado a trayecto ${id_trayecto} con conductor ${id_conductor}`]
      );
    } catch (histErr) {
      console.error("Error actualizando historial vehículo:", histErr);
    }

    res.status(201).json({
      mensaje: "Trayecto asignado exitosamente",
      asignacion: vehiculoTrayectoRes.rows[0],
      conductor_trayecto: conductorTrayectoRes.rows[0]
    });
  } catch (error) {
    console.error("Error asignando trayecto:", error);
    res.status(500).json({ error: "Error al asignar trayecto" });
  }
};

// Listar trayectos disponibles
export const listarTrayectos = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id_trayecto, origen, destino, distancia_km, tiempo_estimado FROM Trayecto ORDER BY id_trayecto`
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
      `SELECT id_asignacion, id_vehiculo, id_conductor, id_trayecto, fecha_asignacion FROM Vehiculo_Conductor_Trayecto WHERE id_asignacion = $1`,
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
      `SELECT id_trayecto, origen, destino, distancia_km, tiempo_estimado FROM Trayecto WHERE id_trayecto = $1`,
      [asign.id_trayecto]
    );

    res.json({
      asignacion: asign,
      vehiculo: vehiculoRes.rows[0] || null,
      conductor: conductorRes.rows[0] || null,
      trayecto: trayectoRes.rows[0] || null
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

    const query = `
      UPDATE Trayecto
      SET origen = COALESCE($1, origen),
          destino = COALESCE($2, destino),
          distancia_km = COALESCE($3, distancia_km),
          tiempo_estimado = COALESCE($4, tiempo_estimado)
      WHERE id_trayecto = $5
      RETURNING id_trayecto, origen, destino, distancia_km, tiempo_estimado
    `;

    const values = [origen || null, destino || null, distancia_km || null, tiempo_estimado || null, id_trayecto];
    const result = await db.query(query, values);

    if (result.rows.length === 0) return res.status(404).json({ error: "Trayecto no encontrado" });

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
export const listarAsignaciones = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id_asignacion, id_vehiculo, id_conductor, id_trayecto, fecha_asignacion FROM Vehiculo_Conductor_Trayecto ORDER BY fecha_asignacion DESC`
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

    const result = await db.query(
      `INSERT INTO Trayecto (origen, destino, distancia_km, tiempo_estimado) VALUES ($1, $2, $3, $4) RETURNING id_trayecto, origen, destino, distancia_km, tiempo_estimado`,
      [origen, destino, distancia_km, tiempo_estimado]
    );

    res.status(201).json({ mensaje: "Trayecto creado", trayecto: result.rows[0] });
  } catch (error) {
    console.error("Error creando trayecto:", error);
    res.status(500).json({ error: "Error al crear trayecto" });
  }
};
