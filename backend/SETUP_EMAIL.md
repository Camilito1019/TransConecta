# Configuración de Recuperación de Contraseña con Gmail

## Configurar Gmail para envío de correos

### Paso 1: Habilitar Verificación en Dos Pasos

1. Ve a [Cuenta de Google](https://myaccount.google.com/)
2. Selecciona **Seguridad** en el menú lateral
3. Busca **Verificación en dos pasos** y actívala si aún no lo está
4. Sigue los pasos para configurarla con tu teléfono

### Paso 2: Generar Contraseña de Aplicación

1. Ve nuevamente a **Seguridad**
2. Busca **Contraseñas de aplicaciones** (aparecerá solo si tienes la verificación en dos pasos activada)
3. Selecciona **Correo** como aplicación
4. Selecciona tu dispositivo o **Otro (nombre personalizado)**
5. Escribe "TransConecta" como nombre
6. Haz clic en **Generar**
7. Google te mostrará una contraseña de 16 caracteres (sin espacios)
8. **Copia esta contraseña**, la necesitarás para el archivo `.env`

### Paso 3: Configurar Variables de Entorno

1. Crea un archivo `.env` en la carpeta `backend/` si no existe
2. Agrega las siguientes líneas:

```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Importante:**
- Reemplaza `tu-email@gmail.com` con tu correo de Gmail
- Reemplaza `xxxx xxxx xxxx xxxx` con la contraseña de aplicación generada
- Puedes copiar la contraseña con espacios o sin espacios, ambos funcionan

### Paso 4: Instalar Dependencias

En la carpeta `backend/`, ejecuta:

```bash
npm install
```

Esto instalará `nodemailer` y todas las dependencias necesarias.

### Paso 5: Reiniciar el Servidor

```bash
npm run dev
```

## Probar la Funcionalidad

1. Ve al frontend: `http://localhost:5173/login`
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa un correo registrado en el sistema
4. Revisa tu bandeja de entrada (o spam) para el código OTP
5. Ingresa el código de 6 dígitos
6. Crea una nueva contraseña

## Endpoints de la API

### Solicitar OTP
```
POST /api/solicitar-otp
Body: { "correo": "usuario@example.com" }
```

### Verificar OTP
```
POST /api/verificar-otp
Body: { "correo": "usuario@example.com", "codigo": "123456" }
```

### Restablecer Contraseña
```
POST /api/restablecer-contrasena
Body: { 
  "correo": "usuario@example.com", 
  "token": "token-recibido", 
  "nueva_contrasena": "nuevaPassword123" 
}
```

## Seguridad

- Los códigos OTP expiran en 10 minutos
- Máximo 3 intentos para ingresar el código correcto
- El token de restablecimiento expira en 15 minutos
- Los códigos expirados se limpian automáticamente cada 5 minutos

## Solución de Problemas

### Error: "Invalid login"
- Verifica que la verificación en dos pasos esté activada
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal de Gmail

### No llega el correo
- Revisa la carpeta de spam
- Verifica que el correo esté correctamente escrito en el archivo `.env`
- Revisa los logs del servidor para ver si hay errores

### Error: "getaddrinfo ENOTFOUND smtp.gmail.com"
- Verifica tu conexión a internet
- Asegúrate de que no hay un firewall bloqueando el puerto 587

## Personalización

Puedes personalizar el correo editando el HTML en:
```
backend/controllers/recuperar_contrasena.controller.js
```

Busca la sección `mailOptions` en la función `solicitarOTP`.
