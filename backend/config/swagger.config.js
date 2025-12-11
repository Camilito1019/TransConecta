import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransConecta API',
      version: '1.0.0',
      description: `API para la gestión de transportes, conductores, vehículos y trayectos de TransConecta.

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación JWT. Para usar la API:

1. **Inicia sesión** usando POST /api/login con tus credenciales
2. **Copia el token** de la respuesta
3. Haz clic en el botón **"Authorize"** (🔒) arriba
4. Ingresa: \`Bearer TU_TOKEN_AQUI\` (incluye "Bearer " antes del token)
5. Haz clic en **"Authorize"** y cierra el modal

**Credenciales de prueba:**
- Correo: admin@transconecta.com
- Contraseña: admin123

Ahora podrás probar todos los endpoints protegidos.

## 📋 Roles y Permisos

- **ADMINISTRADOR**: Acceso completo
- **COORDINADOR**: Crear y ver recursos
- **OPERADOR**: Solo lectura
- **HSEQ**: Gestión de horas y alertas de fatiga`,
      contact: {
        name: 'TransConecta',
        email: 'soporte@transconecta.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    security: [],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido al iniciar sesión'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            mensaje: {
              type: 'string',
              description: 'Descripción detallada del error'
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id_usuario: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del usuario (activo/inactivo)'
            },
            requiere_cambio_contrasena: {
              type: 'boolean',
              description: 'Indica si el usuario debe cambiar su contraseña'
            },
            fecha_creacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario'
            },
            id_rol: {
              type: 'integer',
              description: 'ID del rol asignado al usuario'
            },
            nombre_rol: {
              type: 'string',
              description: 'Nombre del rol asignado'
            }
          }
        },
        Rol: {
          type: 'object',
          properties: {
            id_rol: {
              type: 'integer',
              description: 'ID único del rol'
            },
            nombre_rol: {
              type: 'string',
              description: 'Nombre del rol'
            },
            puede_crear: {
              type: 'boolean',
              description: 'Permiso para crear recursos'
            },
            puede_modificar: {
              type: 'boolean',
              description: 'Permiso para modificar recursos'
            },
            puede_eliminar: {
              type: 'boolean',
              description: 'Permiso para eliminar recursos'
            },
            acceso_hseq: {
              type: 'boolean',
              description: 'Acceso a funcionalidades de HSEQ'
            }
          }
        },
        Vehiculo: {
          type: 'object',
          properties: {
            id_vehiculo: {
              type: 'integer',
              description: 'ID único del vehículo'
            },
            placa: {
              type: 'string',
              description: 'Placa del vehículo'
            },
            tipo: {
              type: 'string',
              description: 'Tipo de vehículo'
            },
            marca: {
              type: 'string',
              description: 'Marca del vehículo'
            },
            modelo: {
              type: 'string',
              description: 'Modelo del vehículo'
            },
            ano: {
              type: 'integer',
              description: 'Año del vehículo'
            },
            capacidad: {
              type: 'string',
              description: 'Capacidad del vehículo'
            },
            estado_operativo: {
              type: 'string',
              enum: ['disponible', 'en_ruta', 'mantenimiento', 'fuera_de_servicio'],
              description: 'Estado operativo del vehículo'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del vehículo (activo/inactivo)'
            },
            fecha_registro: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro del vehículo'
            }
          }
        },
        Conductor: {
          type: 'object',
          properties: {
            id_conductor: {
              type: 'integer',
              description: 'ID único del conductor'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del conductor'
            },
            cedula: {
              type: 'string',
              description: 'Cédula del conductor'
            },
            licencia: {
              type: 'string',
              description: 'Número de licencia de conducción'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono del conductor'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del conductor'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del conductor (activo/inactivo)'
            },
            fecha_registro: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro del conductor'
            }
          }
        },
        Trayecto: {
          type: 'object',
          properties: {
            id_trayecto: {
              type: 'integer',
              description: 'ID único del trayecto'
            },
            origen: {
              type: 'string',
              description: 'Lugar de origen'
            },
            destino: {
              type: 'string',
              description: 'Lugar de destino'
            },
            distancia_km: {
              type: 'number',
              format: 'float',
              description: 'Distancia en kilómetros'
            },
            duracion_estimada: {
              type: 'string',
              description: 'Duración estimada del trayecto'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción adicional del trayecto'
            },
            fecha_creacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del trayecto'
            }
          }
        },
        Asignacion: {
          type: 'object',
          properties: {
            id_asignacion: {
              type: 'integer',
              description: 'ID único de la asignación'
            },
            id_trayecto: {
              type: 'integer',
              description: 'ID del trayecto asignado'
            },
            id_conductor: {
              type: 'integer',
              description: 'ID del conductor asignado'
            },
            id_vehiculo: {
              type: 'integer',
              description: 'ID del vehículo asignado'
            },
            fecha_asignacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de la asignación'
            },
            fecha_inicio: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de inicio del viaje'
            },
            fecha_fin: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de finalización del viaje'
            },
            estado: {
              type: 'string',
              enum: ['programado', 'en_progreso', 'completado', 'cancelado'],
              description: 'Estado de la asignación'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de autenticación faltante o inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Token no proporcionado',
                mensaje: 'Debe incluir el header Authorization: Bearer <token>'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'No tiene permisos para realizar esta acción',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Acceso denegado',
                mensaje: 'No tiene permisos suficientes para realizar esta acción'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'No encontrado',
                mensaje: 'El recurso solicitado no existe'
              }
            }
          }
        },
        BadRequestError: {
          description: 'Solicitud incorrecta',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Solicitud incorrecta',
                mensaje: 'Los datos proporcionados son inválidos'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para login, logout y gestión de perfil'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Roles',
        description: 'Gestión de roles y permisos'
      },
      {
        name: 'Vehículos',
        description: 'Gestión de vehículos y documentos'
      },
      {
        name: 'Conductores',
        description: 'Gestión de conductores'
      },
      {
        name: 'Trayectos',
        description: 'Gestión de trayectos y asignaciones'
      },
      {
        name: 'Contraseñas',
        description: 'Cambio y recuperación de contraseñas'
      }
    ]
  },
  apis: ['./routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
