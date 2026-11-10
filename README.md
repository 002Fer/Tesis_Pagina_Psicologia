# Plataforma Web para la Gestión Administrativa de Servicios Psicológicos

Plataforma integral diseñada para la administración y coordinación clínica de servicios psicológicos. Cuenta con una arquitectura desacoplada: **Frontend en React (Vite + Tailwind CSS)** y **Backend en Node.js (Express + PostgreSQL + JWT)**, con soporte para los tres roles del sistema:
1. **Administrador / Coordinador**
2. **Profesional de Atención Psicológica**
3. **Paciente / Usuario Externo**

---

## 🏗️ Arquitectura General

```text
       React (Vite + Tailwind)  ───►  http://localhost:5173
                 │
                 │ HTTP / JSON (REST API con JWT)
                 ▼
       Express (Node.js)        ───►  http://localhost:3001/api
                 │
                 │ Pool de Conexiones (pg)
                 ▼
       PostgreSQL 16 (Docker)   ───►  localhost:5433 (psicologia_db)
```

---

## 📁 Estructura del Repositorio

```text
Tesis_Pagina_Psicologia/
│
├── database/
│   ├── schema.sql                     # Esquema relacional con 14 tablas, constraints e índices
│   └── seeds.sql                      # Datos semilla iniciales (roles, consultorios)
│
├── docs/
│   └── api-collection.json            # Colección para Thunder Client y Postman
│
├── backend/
│   ├── src/
│   │   ├── config/database.js         # Pool PostgreSQL (pg)
│   │   ├── controllers/               # Controladores HTTP de la API REST
│   │   ├── routes/                    # Enrutadores organizados por módulo
│   │   ├── services/                  # Lógica de negocio y transacciones ACID
│   │   ├── middlewares/               # JWT (auth), Roles (RBAC) y ErrorHandler
│   │   └── scripts/                   # Scripts de inicialización, seeds y test E2E
│   ├── server.js                      # Servidor Express
│   └── .env                           # Variables de entorno backend (puerto 3001)
│
├── frontend/
│   ├── src/
│   │   ├── components/common/         # Botones, Inputs, Selects, Modales, Badges, Alertas
│   │   ├── context/AuthContext.jsx    # Estado global de sesión, token JWT y perfil
│   │   ├── layouts/DashboardLayout.jsx# Barra superior, menú lateral y responsive drawer
│   │   ├── routes/ProtectedRoute.jsx  # Protección y redirección inteligente por rol
│   │   ├── services/                  # Clientes Axios por entidad (citas, pacientes, etc.)
│   │   └── pages/
│   │       ├── auth/                  # Login y Registro de pacientes
│   │       ├── patient/               # Dashboard, Búsqueda de terapeutas, Citas, Solicitudes
│   │       ├── professional/          # Agenda diaria/semanal, Pacientes, Horarios, Seguimiento
│   │       └── admin/                 # Métricas globales, Usuarios, Profesionales, Espacios, Reportes
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env                           # VITE_API_URL=http://localhost:3001/api
│
└── docker-compose.yml                 # Contenedor de PostgreSQL 16
```

---

## 🚀 Guía de Puesta en Marcha

### 1. Iniciar Base de Datos PostgreSQL
Desde la raíz del proyecto:
```bash
docker compose up -d
```

*(Si es la primera vez o deseas reiniciar los datos demo)*:
```bash
cd backend
npm run db:init
npm run db:seed
```

### 2. Iniciar el Backend
En una terminal:
```bash
cd backend
npm run dev
```
Servidor disponible en: `http://localhost:3001/api` (Healthcheck: `http://localhost:3001/api/health`).

### 3. Iniciar el Frontend
En una segunda terminal:
```bash
cd frontend
npm run dev
```
Aplicación web disponible en: **`http://localhost:5173`**.

---

## 👥 Cuentas de Acceso Rápido (Demo)

| Rol | Correo Electrónico | Contraseña | Perfil Asociado |
|---|---|---|---|
| **Administrador** | `admin@clinica.com` | `Admin123*` | Coordinación General |
| **Profesional** | `profesional@clinica.com` | `Profe123*` | Lic. Carlos Pérez Gómez |
| **Paciente** | `paciente@gmail.com` | `Paciente123*` | Ana Martínez Ruiz |

> [!TIP]
> En la pantalla de inicio de sesión (`/login`), dispones de botones de acceso rápido que autocompletan las credenciales de cada rol con un solo clic.

---

## 🌟 Funcionalidades por Módulo del Frontend

### 1. Módulo del Paciente
- **Dashboard:** Estado administrativo actual (`SOLICITANTE`, `EN_ESPERA`, `ACTIVO`), próxima sesión programada y resumen del terapeuta asignado.
- **Búsqueda y Agendamiento:** Catálogo de profesionales activos, visualización de slots libres en tiempo real (descontando citas existentes) y reserva de cita inicial.
- **Mis Citas:** Historial completo, cancelación con motivo y reprogramación con selección de nueva fecha/hora (conservando trazabilidad con `cita_anterior`).
- **Solicitud de Atención:** Envío de motivo de consulta para apertura de expediente.
- **Perfil:** Edición de datos personales y administración de contactos responsables / familiares (1:N).

### 2. Módulo del Profesional
- **Dashboard:** Métricas del terapeuta (pacientes activos, citas del día, total de sesiones realizadas y programadas).
- **Agenda Clínica:** Filtro por fecha y estado, visualización de consultorio asignado y teléfono del paciente.
- **Mis Pacientes:** Directorio de pacientes vinculados y consulta de auditoría administrativa (`historial_administrativo`).
- **Configuración de Disponibilidad:** Gestión semanal de franjas horarias de atención (alta y desactivación de horarios).
- **Planes de Seguimiento:** Configuración de frecuencias (`SEMANAL`, `QUINCENAL`, `MENSUAL`, `DOS_VECES_SEMANA`), modificación de periodicidad y finalización de tratamiento.
- **Control de Asistencia:** Registro de `ASISTIO` / `NO_ASISTIO` (con inasistencias justificadas o injustificadas) y auto-vinculación en la primera atención.

### 3. Módulo del Administrador
- **Dashboard Global:** Monitoreo en tiempo real de pacientes activos, en espera, terapeutas, consultorios y estado de citas.
- **Gestión de Usuarios:** Directorio centralizado de cuentas y registro de usuarios con asignación de roles.
- **Equipo de Profesionales:** Alta de nuevos terapeutas y conmutación de estado operativo.
- **Padrón de Pacientes:** Registro manual de pacientes y asignación administrativa de terapeutas.
- **Espacios y Consultorios:** Alta y control de disponibilidad de salas físicas y telemáticas.
- **Supervisión Global de Citas:** Monitoreo transversal de la agenda clínica del centro.
- **Reportes e Indicadores:** Estadísticas cuantitativas de cancelaciones, asistencias vs inasistencias, carga de trabajo por profesional, ocupación de consultorios y distribución de pacientes por estado.
