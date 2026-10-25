const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('[SEED] Iniciando inserción de datos iniciales...');
    await client.query('BEGIN');

    // 1. Ejecutar seeds.sql (roles y espacios)
    const seedsPath = path.join(__dirname, '../../../database/seeds.sql');
    if (fs.existsSync(seedsPath)) {
      const seedsSql = fs.readFileSync(seedsPath, 'utf8');
      await client.query(seedsSql);
      console.log('[SEED] Roles y espacios insertados.');
    }

    // 2. Crear usuario Administrador
    const adminEmail = 'admin@clinica.com';
    const adminPassHash = await bcrypt.hash('Admin123*', 10);
    const adminRes = await client.query(
      `INSERT INTO usuario (id_rol, correo, password_hash, estado)
       VALUES (1, $1, $2, 'ACTIVO')
       ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id_usuario`,
      [adminEmail, adminPassHash]
    );
    const adminId = adminRes.rows[0].id_usuario;
    console.log(`[SEED] Usuario Administrador listo: ${adminEmail} (ID: ${adminId})`);

    // 3. Crear usuario Profesional + Perfil Profesional
    const docEmail = 'profesional@clinica.com';
    const docPassHash = await bcrypt.hash('Profe123*', 10);
    const docUserRes = await client.query(
      `INSERT INTO usuario (id_rol, correo, password_hash, estado)
       VALUES (2, $1, $2, 'ACTIVO')
       ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id_usuario`,
      [docEmail, docPassHash]
    );
    const docUserId = docUserRes.rows[0].id_usuario;

    const profRes = await client.query(
      `INSERT INTO profesional (id_usuario, nombres, apellidos, telefono, estado)
       VALUES ($1, 'Carlos', 'Pérez Gómez', '555-0101', 'ACTIVO')
       ON CONFLICT (id_usuario) DO UPDATE SET
         nombres = EXCLUDED.nombres,
         apellidos = EXCLUDED.apellidos
       RETURNING id_profesional`,
      [docUserId]
    );
    const profId = profRes.rows[0].id_profesional;
    console.log(`[SEED] Usuario Profesional listo: ${docEmail} (Prof ID: ${profId})`);

    // Disponibilidad del profesional:
    // Lunes (1) 08:00 - 13:00, Miércoles (3) 14:00 - 18:00, Viernes (5) 09:00 - 15:00
    await client.query('DELETE FROM disponibilidad WHERE id_profesional = $1', [profId]);
    await client.query(
      `INSERT INTO disponibilidad (id_profesional, dia_semana, hora_inicio, hora_fin, activo)
       VALUES 
       ($1, 1, '08:00:00', '13:00:00', TRUE),
       ($1, 3, '14:00:00', '18:00:00', TRUE),
       ($1, 5, '09:00:00', '15:00:00', TRUE)`,
      [profId]
    );
    console.log('[SEED] Disponibilidad horaria del profesional registrada.');

    // 4. Crear usuario Paciente + Perfil Paciente
    const pacEmail = 'paciente@gmail.com';
    const pacPassHash = await bcrypt.hash('Paciente123*', 10);
    const pacUserRes = await client.query(
      `INSERT INTO usuario (id_rol, correo, password_hash, estado)
       VALUES (3, $1, $2, 'ACTIVO')
       ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id_usuario`,
      [pacEmail, pacPassHash]
    );
    const pacUserId = pacUserRes.rows[0].id_usuario;

    const pacRes = await client.query(
      `INSERT INTO paciente (id_usuario, nombres, apellidos, fecha_nacimiento, telefono, estado)
       VALUES ($1, 'Ana', 'Martínez Ruiz', '1998-05-14', '555-0202', 'SOLICITANTE')
       ON CONFLICT (id_usuario) DO UPDATE SET
         nombres = EXCLUDED.nombres,
         apellidos = EXCLUDED.apellidos
       RETURNING id_paciente`,
      [pacUserId]
    );
    const pacId = pacRes.rows[0].id_paciente;
    console.log(`[SEED] Usuario Paciente listo: ${pacEmail} (Pac ID: ${pacId})`);

    // Solicitud inicial para Ana
    await client.query(
      `INSERT INTO solicitud_atencion (id_paciente, motivo_consulta, estado)
       VALUES ($1, 'Solicitud para manejo de ansiedad y técnicas de estudio', 'PENDIENTE')`,
      [pacId]
    );

    await client.query('COMMIT');
    console.log('[SEED] ¡Semillas insertadas exitosamente!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED] Error insertando semillas:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
