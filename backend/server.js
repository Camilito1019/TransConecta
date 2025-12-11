import express from 'express';
import cors from 'cors';
import { db } from './config/db.js';
import bcrypt from 'bcryptjs';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config.js';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import cambioContrasenaRoutes from "./routes/cambio_contrasena.routes.js";
import recuperarContrasenaRoutes from "./routes/recuperar_contrasena.routes.js";
import vehiculoRoutes from "./routes/vehiculo.routes.js";
import conductorRoutes from "./routes/conductor.routes.js";
import trayectoRoutes from "./routes/trayecto.routes.js";



const app = express();

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('uploads')); // Servir archivos estáticos

// Documentación Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TransConecta API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
    }
}));

// RUTA PRINCIPAL PARA QUE NO SALGA "Cannot GET /"
app.get('/', (req, res) => {
    res.send("Bienvenido a la API de TransConecta 🚀 - Documentación disponible en /docs");
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

const PORT = process.env.PORT || 3000;
app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", roleRoutes);
app.use("/api", cambioContrasenaRoutes);
app.use("/api", recuperarContrasenaRoutes);
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
