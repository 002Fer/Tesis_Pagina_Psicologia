-- ============================================================
-- PLATAFORMA DE GESTIÓN ADMINISTRATIVA DE SERVICIOS PSICOLÓGICOS
-- Datos Semilla Iniciales (Seeds)
-- ============================================================

-- 1. Insertar roles iniciales
INSERT INTO rol (id_rol, nombre, descripcion) VALUES
(1, 'ADMINISTRADOR', 'Administrador o coordinador general de la plataforma con acceso global'),
(2, 'PROFESIONAL', 'Profesional de atención psicológica con autonomía en su agenda y pacientes'),
(3, 'PACIENTE', 'Paciente o usuario externo con acceso a autoservicio de citas')
ON CONFLICT (id_rol) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion;

-- Ajustar la secuencia de rol si es necesario
SELECT setval('rol_id_rol_seq', (SELECT MAX(id_rol) FROM rol));

-- 2. Insertar espacios de atención iniciales
INSERT INTO espacio (nombre, descripcion, ubicacion, estado) VALUES
('Consultorio 1', 'Consultorio para atención individual y entrevistas', 'Piso 1 - Ala Norte', 'DISPONIBLE'),
('Consultorio 2', 'Consultorio para atención individual', 'Piso 1 - Ala Norte', 'DISPONIBLE'),
('Consultorio 3 (Infantil/Familiar)', 'Espacio acondicionado para atención de familias y dinámicas', 'Piso 1 - Ala Sur', 'DISPONIBLE'),
('Sala de Atención Virtual 1', 'Espacio equipado con terminal para teleatención', 'Piso 2 - Sala Telemática', 'DISPONIBLE')
ON CONFLICT (nombre) DO NOTHING;
