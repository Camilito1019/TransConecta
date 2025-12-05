import express from 'express';
import { db } from './config/db.js';
import bcrypt from 'bcryptjs';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import cambioContrasenaRoutes from "./routes/cambio_contrasena.routes.js";
import vehiculoRoutes from "./routes/vehiculo.routes.js";
import conductorRoutes from "./routes/conductor.routes.js";
import trayectoRoutes from "./routes/trayecto.routes.js";



const app = express();
app.use(express.json());
app.use(express.static('uploads')); // Servir archivos estáticos

// RUTA PRINCIPAL PARA QUE NO SALGA "Cannot GET /"
app.get('/', (req, res) => {
    res.send("Bienvenido a la API de TransConecta 🚀");
});

// Endpoint para probar la conexión con Docker/PostgreSQL
app.post('/api/test-db', async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({
            connected: true,
            time: result.rows[0].now
        });
    } catch (err) {
        res.status(500).json({ connected: false, error: err.message });
    }
});

// Helper: validación de email simple
function isValidEmail(email) {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
}

// Crear usuario (DEBE SER POST, NO GET)
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre_usuario, correo, contraseña, estado } = req.body;

        // Validaciones
        if (!nombre_usuario || !correo || !contraseña) {
            return res.status(400).json({ error: 'Faltan campos requeridos: nombre_usuario, correo o contraseña' });
        }

        if (typeof nombre_usuario !== 'string' || nombre_usuario.length > 100) {
            return res.status(400).json({ error: 'nombre_usuario inválido' });
        }

        if (!isValidEmail(correo) || correo.length > 100) {
            return res.status(400).json({ error: 'correo inválido' });
        }

        const estadoNormalized = estado ? estado.toString().toLowerCase() : 'activo';
        if (!['activo', 'inactivo'].includes(estadoNormalized)) {
            return res.status(400).json({ error: "estado debe ser 'activo' o 'inactivo'" });
        }

        // Hashear contraseña
        const hashed = await bcrypt.hash(contraseña, 10);

        const insertQuery = `
            INSERT INTO Usuario (nombre_usuario, correo, "contraseña", estado)
            VALUES ($1, $2, $3, $4)
            RETURNING id_usuario, nombre_usuario, correo, estado, fecha_creacion
        `;

        const values = [nombre_usuario, correo, hashed, estadoNormalized];

        const result = await db.query(insertQuery, values);
        const usuario = result.rows[0];

        res.status(201).json({ usuario });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }
        console.error('Error creando usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", roleRoutes);
app.use("/api", cambioContrasenaRoutes);
app.use("/api", vehiculoRoutes);
app.use("/api", conductorRoutes);
app.use("/api", trayectoRoutes);

// Middleware para capturar rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        mensaje: `No existe la ruta ${req.method} ${req.originalUrl}`,
        rutas_disponibles: {
            usuarios: [
                'POST /api/register',
                'GET /api/usuarios',
                'GET /api/usuarios/:id_usuario',
                'PUT /api/usuarios/:id_usuario',
                'PATCH /api/usuarios/:id_usuario/inactivar',
                'PATCH /api/usuarios/:id_usuario/activar',
                'DELETE /api/usuarios/:id_usuario'
            ],
            autenticacion: [
                'POST /api/login',
                'POST /api/logout'
            ],
            roles: [
                'GET /api/roles',
                'POST /api/roles',
                'GET /api/roles/:id_rol',
                'PUT /api/roles/:id_rol',
                'DELETE /api/roles/:id_rol',
                'PUT /api/usuarios/:id_usuario/rol'
            ],
            cambio_contrasena: [
                'POST /api/cambiar-contrasena'
            ],
            vehiculos: [
                'POST /api/vehiculos',
                'GET /api/vehiculos',
                'GET /api/vehiculos/:id_vehiculo',
                'PUT /api/vehiculos/:id_vehiculo',
                'PATCH /api/vehiculos/:id_vehiculo/desactivar',
                'PATCH /api/vehiculos/:id_vehiculo/activar',
                'PATCH /api/vehiculos/:id_vehiculo/estado'
            ],
            documentos: [
                'POST /api/vehiculos/:id_vehiculo/documentos',
                'GET /api/vehiculos/:id_vehiculo/documentos',
                'GET /api/documentos/:id_documento',
                'GET /api/documentos/:id_documento/descargar',
                'GET /api/vehiculos/:id_vehiculo/historial'
            ]
            ,
            conductores: [
                'POST /api/conductores',
                'GET /api/conductores',
                'GET /api/conductores/:id_conductor',
                'PUT /api/conductores/:id_conductor',
                'PATCH /api/conductores/:id_conductor/desactivar',
                'PATCH /api/conductores/:id_conductor/activar',
                'GET /api/conductores/:id_conductor/detalles',
                'GET /api/conductores/:id_conductor/historial',
                'POST /api/conductores/:id_conductor/horas',
                'POST /api/conductores/:id_conductor/alertas-fatiga'
            ],
            trayectos: [
                'POST /api/trayectos',
                'GET /api/trayectos',
                'PUT /api/trayectos/:id_trayecto',
                'POST /api/asignaciones',
                'GET /api/asignaciones',
                'GET /api/asignaciones/:id_asignacion',
                'DELETE /api/asignaciones/:id_asignacion'
            ]
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});
