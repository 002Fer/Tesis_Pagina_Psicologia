# Plataforma Web para la Gestión Administrativa de Servicios Psicológicos

Backend desarrollado con **Node.js**, **Express**, **PostgreSQL** y **JWT**, siguiendo la arquitectura y especificaciones del plan técnico de tesis.

---

## 🚀 Arquitectura y Tecnologías

- **Lenguaje:** JavaScript (Node.js v22+)
- **Framework API:** Express.js
- **Base de Datos:** PostgreSQL 16 (ejecutado con Docker Compose)
- **Autenticación:** JSON Web Tokens (JWT) y cifrado seguro de contraseñas con `bcryptjs`
- **Seguridad:** Middlewares de autenticación, autorización basada en roles (RBAC) y control de conflictos por concurrencia bajo transacciones ACID (`BEGIN ... COMMIT / ROLLBACK`).
- **Pruebas de API:** Thunder Client / Postman (Colección incluida en `docs/api-collection.json`)

---

## 📁 Estructura del Proyecto

```text
Tesis_Pagina_Psicologia/
│
├── database/
│   ├── schema.sql           # Esquema relacional completo (14 tablas con índices y constraints)
│   └── seeds.sql            # Datos iniciales (roles, espacios, catálogos)
│
├── docs/
│   └── api-collection.json  # Colección para Thunder Client / Postman
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js             # Pool de conexiones PostgreSQL (pg)
│   │   ├── controllers/                # Controladores HTTP
│   │   │   ├── auth.controller.js
│   │   │   ├── pacientes.controller.js
│   │   │   ├── profesionales.controller.js
│   │   │   ├── espacios.controller.js
│   │   │   ├── citas.controller.js
│   │   │   ├── seguimiento.controller.js
│   │   │   ├── asistencias.controller.js
│   │   │   └── reportes.controller.js
│   │   ├── routes/                     # Rutas organizadas por módulo
│   │   │   ├── auth.routes.js
│   │   │   ├── pacientes.routes.js
│   │   │   ├── profesionales.routes.js
│   │   │   ├── espacios.routes.js
│   │   │   ├── citas.routes.js
│   │   │   ├── seguimiento.routes.js
│   │   │   ├── asistencias.routes.js
│   │   │   └── reportes.routes.js
│   │   ├── services/                   # Lógica de negocio y transacciones SQL
│   │   │   ├── auth.service.js
│   │   │   ├── pacientes.service.js
│   │   │   ├── profesionales.service.js
│   │   │   ├── espacios.service.js
│   │   │   ├── citas.service.js
│   │   │   ├── seguimiento.service.js
│   │   │   ├── asistencias.service.js
│   │   │   └── reportes.service.js
│   │   ├── middlewares/                # Middlewares globales
│   │   │   ├── auth.middleware.js      # Verificación de JWT
│   │   │   ├── role.middleware.js      # Control de acceso por rol
│   │   │   └── error.middleware.js     # Manejador centralizado de errores
│   │   ├── utils/
│   │   │   ├── jwt.utils.js            # Firma y verificación de tokens
│   │   │   └── response.utils.js       # Respuestas JSON estandarizadas
│   │   ├── scripts/
│   │   │   ├── initDb.js               # Creación automática de BD y tablas
│   │   │   ├── seedDb.js               # Inserción de usuarios y datos de prueba
│   │   │   └── testEndpoints.js        # Suite de pruebas E2E automatizada
│   │   └── app.js                      # Configuración de Express, CORS y middlewares
│   ├── .env                            # Variables de entorno
│   ├── .env.example
│   ├── package.json
│   └── server.js                       # Punto de entrada del servidor
│
├── docker-compose.yml                  # Configuración de PostgreSQL en Docker
└── README.md
```

---

## ⚙️ Puesta en Marcha

### 1. Iniciar Base de Datos con Docker
Desde la raíz del proyecto:
```bash
docker compose up -d
```
Verifica que el contenedor esté corriendo:
```bash
docker ps
```

### 2. Configurar Variables de Entorno
En `backend/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5433
DB_NAME=psicologia_db
DB_USER=postgres
DB_PASSWORD=postgres123
JWT_SECRET=super_secret_jwt_key_tesis_psicologia_2026_segura
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Instalar Dependencias y Cargar Datos
```bash
cd backend
npm install
npm run db:init     # Crea las tablas e índices si no existen
npm run db:seed     # Inserta roles, espacios y usuarios demo
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm run dev
# o para producción:
npm start
```
El servidor quedará disponible en:
- API Base: `http://localhost:3001/api`
- Healthcheck: `http://localhost:3001/api/health`

---

## 👥 Usuarios de Prueba Semilla

| Rol | Correo | Contraseña | Perfil Demo |
|---|---|---|---|
| **ADMINISTRADOR** | `admin@clinica.com` | `Admin123*` | Administrador General |
| **PROFESIONAL** | `profesional@clinica.com` | `Profe123*` | Dr. Carlos Pérez |
| **PACIENTE** | `paciente@gmail.com` | `Paciente123*` | Ana Martínez |

---

## 🛡️ Reglas de Negocio Implementadas

1. **Detección Atómica de Conflictos de Horario:**
   Al programar o reprogramar citas, se comprueba atómicamente bajo transacción que ni el profesional, ni el paciente, ni el espacio físico tengan otra cita en el intervalo `(inicio_existente < nuevo_fin AND fin_existente > nuevo_inicio)`.
2. **Trazabilidad de Reprogramaciones:**
   Las reprogramaciones marcan la cita anterior como `REPROGRAMADA` y crean una nueva fila vinculada mediante la llave `cita_anterior`, sin eliminar el historial.
3. **Flujo de Primera Cita y Seguimiento:**
   - La primera cita (`INICIAL`) actualiza el estado del paciente a `EN_ESPERA`.
   - Al registrar la asistencia (`ASISTIO`), el paciente pasa a `ACTIVO` y queda formalmente vinculado con el profesional.
   - El profesional puede definir planes con frecuencias (`SEMANAL`, `QUINCENAL`, `MENSUAL`, `DOS_VECES_SEMANA`) y generar citas recurrentes automáticas.
4. **Historial Administrativo:**
   Cada cambio relevante (registro, cita, cambio de frecuencia, finalización) queda auditado en `historial_administrativo` con metadatos en formato `JSONB`.

---

## 🧪 Pruebas Automatizadas
Para ejecutar la suite completa de pruebas de endpoints:
```bash
cd backend
node src/scripts/testEndpoints.js
```
