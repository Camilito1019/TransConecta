-- Agregar columna requiere_cambio_contrasena a la tabla usuario
-- Esta columna indica si el usuario debe cambiar su contraseña en el próximo login

ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS requiere_cambio_contrasena BOOLEAN DEFAULT false;

-- Comentario descriptivo
COMMENT ON COLUMN usuario.requiere_cambio_contrasena IS 'Indica si el usuario debe cambiar su contraseña obligatoriamente en el próximo inicio de sesión';

-- Los usuarios existentes no requerirán cambio de contraseña
UPDATE usuario SET requiere_cambio_contrasena = false WHERE requiere_cambio_contrasena IS NULL;
