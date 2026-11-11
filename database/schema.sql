-- ============================================================
-- PLATAFORMA DE GESTIÓN ADMINISTRATIVA DE SERVICIOS PSICOLÓGICOS
-- Esquema de Base de Datos PostgreSQL
-- ============================================================

-- 1. TABLA ROL
CREATE TABLE IF NOT EXISTS rol (
    id_rol BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- 2. TABLA USUARIO
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    id_rol BIGINT NOT NULL REFERENCES rol(id_rol),
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, INACTIVO, BLOQUEADO
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA PACIENTE
CREATE TABLE IF NOT EXISTS paciente (
    id_paciente BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT UNIQUE REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    telefono VARCHAR(30),
    estado VARCHAR(30) NOT NULL DEFAULT 'SOLICITANTE', -- SOLICITANTE, EN_ESPERA, ACTIVO, BAJA, FINALIZADO
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA RESPONSABLE
CREATE TABLE IF NOT EXISTS responsable (
    id_responsable BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    parentesco VARCHAR(50),
    telefono VARCHAR(30),
    correo VARCHAR(150)
);

-- 5. TABLA PROFESIONAL
CREATE TABLE IF NOT EXISTS profesional (
    id_profesional BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL UNIQUE REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, INACTIVO
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA SOLICITUD_ATENCION
CREATE TABLE IF NOT EXISTS solicitud_atencion (
    id_solicitud BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    motivo_consulta TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, EN_PROCESO, ACEPTADA, CANCELADA
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA VINCULACION
CREATE TABLE IF NOT EXISTS vinculacion (
    id_vinculacion BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL REFERENCES paciente(id_paciente),
    id_profesional BIGINT NOT NULL REFERENCES profesional(id_profesional),
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA', -- ACTIVA, FINALIZADA, CANCELADA
    origen VARCHAR(30) NOT NULL, -- SELECCION_PACIENTE, ASIGNACION_ADMINISTRATIVA
    creado_por BIGINT REFERENCES usuario(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA DISPONIBILIDAD
CREATE TABLE IF NOT EXISTS disponibilidad (
    id_disponibilidad BIGSERIAL PRIMARY KEY,
    id_profesional BIGINT NOT NULL REFERENCES profesional(id_profesional) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fecha_inicio_vigencia DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin_vigencia DATE NULL,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT check_horas_disponibilidad CHECK (hora_fin > hora_inicio)
);

-- 9. TABLA ESPACIO
CREATE TABLE IF NOT EXISTS espacio (
    id_espacio BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    ubicacion VARCHAR(150),
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE', -- DISPONIBLE, NO_DISPONIBLE, INACTIVO
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLA PLAN_SEGUIMIENTO
CREATE TABLE IF NOT EXISTS plan_seguimiento (
    id_plan_seguimiento BIGSERIAL PRIMARY KEY,
    id_vinculacion BIGINT NOT NULL REFERENCES vinculacion(id_vinculacion) ON DELETE CASCADE,
    frecuencia VARCHAR(30) NOT NULL, -- DOS_VECES_SEMANA, SEMANAL, QUINCENAL, MENSUAL, PERSONALIZADA
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, PAUSADO, FINALIZADO
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABLA HORARIO_SEGUIMIENTO
CREATE TABLE IF NOT EXISTS horario_seguimiento (
    id_horario BIGSERIAL PRIMARY KEY,
    id_plan_seguimiento BIGINT NOT NULL REFERENCES plan_seguimiento(id_plan_seguimiento) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
    hora_inicio TIME NOT NULL,
    duracion_minutos INTEGER NOT NULL DEFAULT 60,
    activo BOOLEAN DEFAULT TRUE
);

-- 12. TABLA CITA
CREATE TABLE IF NOT EXISTS cita (
    id_cita BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL REFERENCES paciente(id_paciente),
    id_profesional BIGINT NOT NULL REFERENCES profesional(id_profesional),
    id_espacio BIGINT REFERENCES espacio(id_espacio),
    id_plan_seguimiento BIGINT REFERENCES plan_seguimiento(id_plan_seguimiento),
    creado_por BIGINT REFERENCES usuario(id_usuario),
    fecha_hora_inicio TIMESTAMPTZ NOT NULL,
    fecha_hora_fin TIMESTAMPTZ NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'INICIAL', -- INICIAL, SEGUIMIENTO
    estado VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA', -- PROGRAMADA, REALIZADA, CANCELADA, REPROGRAMADA, INASISTENCIA
    motivo_cancelacion VARCHAR(255) NULL,
    cita_anterior BIGINT REFERENCES cita(id_cita),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_horas_cita CHECK (fecha_hora_fin > fecha_hora_inicio)
);

-- 13. TABLA ASISTENCIA
CREATE TABLE IF NOT EXISTS asistencia (
    id_asistencia BIGSERIAL PRIMARY KEY,
    id_cita BIGINT NOT NULL UNIQUE REFERENCES cita(id_cita) ON DELETE CASCADE,
    estado VARCHAR(30) NOT NULL, -- ASISTIO, NO_ASISTIO
    tipo_inasistencia VARCHAR(30) NULL, -- JUSTIFICADA, INJUSTIFICADA
    registrado_por BIGINT REFERENCES usuario(id_usuario),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. TABLA HISTORIAL_ADMINISTRATIVO
CREATE TABLE IF NOT EXISTS historial_administrativo (
    id_historial BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    id_usuario BIGINT REFERENCES usuario(id_usuario),
    tipo_evento VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    datos_adicionales JSONB NULL,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA MEJORAR RENDIMIENTO EN BÚSQUEDAS FRECUENTES Y VALIDACIONES DE CONFLICTO
CREATE INDEX IF NOT EXISTS idx_cita_profesional_fechas ON cita (id_profesional, fecha_hora_inicio, fecha_hora_fin);
CREATE INDEX IF NOT EXISTS idx_cita_paciente_fechas ON cita (id_paciente, fecha_hora_inicio, fecha_hora_fin);
CREATE INDEX IF NOT EXISTS idx_cita_espacio_fechas ON cita (id_espacio, fecha_hora_inicio, fecha_hora_fin);
CREATE INDEX IF NOT EXISTS idx_cita_estado ON cita (estado);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_profesional ON disponibilidad (id_profesional, dia_semana);
CREATE INDEX IF NOT EXISTS idx_vinculacion_paciente ON vinculacion (id_paciente, estado);
CREATE INDEX IF NOT EXISTS idx_vinculacion_profesional ON vinculacion (id_profesional, estado);
