const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('[SEED] Iniciando inserción de datos iniciales en PostgreSQL...');
    await client.query('BEGIN');

    // 1. Ejecutar seeds.sql (roles y espacios)
    const seedsPath = path.join(__dirname, '../../../database/seeds.sql');
    if (fs.existsSync(seedsPath)) {
      const seedsSql = fs.readFileSync(seedsPath, 'utf8');
      await client.query(seedsSql);
      console.log('[SEED] ✓ Roles y espacios clínicos verificados.');
    }

    // 2. Administrador
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
    console.log(`[SEED] ✓ Usuario Administrador listo: ${adminEmail} (ID: ${adminId})`);

    // Contraseña estándar para profesionales y pacientes de prueba
    const profPassHash = await bcrypt.hash('Profe123*', 10);
    const pacPassHash = await bcrypt.hash('Paciente123*', 10);

    // ========================================================
    // 3. PSICÓLOGOS / PROFESIONALES (11 Profesionales)
    // ========================================================
    const profesionalesData = [
      {
        correo: 'profesional@clinica.com',
        nombres: 'Carlos Roberto',
        apellidos: 'Pérez Gómez',
        telefono: '555-0101',
        disponibilidad: [
          { dia: 1, inicio: '08:00:00', fin: '13:00:00' }, // Lunes
          { dia: 3, inicio: '14:00:00', fin: '18:00:00' }, // Miércoles
          { dia: 5, inicio: '09:00:00', fin: '15:00:00' }, // Viernes
        ],
      },
      {
        correo: 'mvasquez@clinica.com',
        nombres: 'María Elena',
        apellidos: 'Vásquez Soto',
        telefono: '555-0102',
        disponibilidad: [
          { dia: 1, inicio: '13:00:00', fin: '18:00:00' }, // Lunes
          { dia: 2, inicio: '08:00:00', fin: '14:00:00' }, // Martes
          { dia: 4, inicio: '08:00:00', fin: '14:00:00' }, // Jueves
        ],
      },
      {
        correo: 'amendez@clinica.com',
        nombres: 'Alejandro David',
        apellidos: 'Méndez Cruz',
        telefono: '555-0103',
        disponibilidad: [
          { dia: 2, inicio: '14:00:00', fin: '18:00:00' }, // Martes
          { dia: 3, inicio: '08:00:00', fin: '13:00:00' }, // Miércoles
          { dia: 6, inicio: '08:00:00', fin: '13:00:00' }, // Sábado
        ],
      },
      {
        correo: 'smorales@clinica.com',
        nombres: 'Sofía Alejandra',
        apellidos: 'Morales Ruiz',
        telefono: '555-0104',
        disponibilidad: [
          { dia: 1, inicio: '09:00:00', fin: '14:00:00' }, // Lunes
          { dia: 4, inicio: '14:00:00', fin: '18:00:00' }, // Jueves
          { dia: 5, inicio: '13:00:00', fin: '18:00:00' }, // Viernes
        ],
      },
      {
        correo: 'fcastillo@clinica.com',
        nombres: 'Fernando José',
        apellidos: 'Castillo Estrada',
        telefono: '555-0105',
        disponibilidad: [
          { dia: 2, inicio: '09:00:00', fin: '15:00:00' }, // Martes
          { dia: 4, inicio: '09:00:00', fin: '15:00:00' }, // Jueves
          { dia: 6, inicio: '08:00:00', fin: '12:00:00' }, // Sábado
        ],
      },
      {
        correo: 'crivas@clinica.com',
        nombres: 'Claudia Patricia',
        apellidos: 'Rivas Toledo',
        telefono: '555-0106',
        disponibilidad: [
          { dia: 1, inicio: '14:00:00', fin: '19:00:00' }, // Lunes
          { dia: 3, inicio: '08:00:00', fin: '13:00:00' }, // Miércoles
          { dia: 5, inicio: '08:00:00', fin: '13:00:00' }, // Viernes
        ],
      },
      {
        correo: 'rquintana@clinica.com',
        nombres: 'Roberto Andrés',
        apellidos: 'Quintana Barrios',
        telefono: '555-0107',
        disponibilidad: [
          { dia: 2, inicio: '08:00:00', fin: '13:00:00' }, // Martes
          { dia: 3, inicio: '13:00:00', fin: '17:00:00' }, // Miércoles
          { dia: 4, inicio: '08:00:00', fin: '13:00:00' }, // Jueves
        ],
      },
      {
        correo: 'lhernandez@clinica.com',
        nombres: 'Laura Jimena',
        apellidos: 'Hernández Aguilar',
        telefono: '555-0108',
        disponibilidad: [
          { dia: 1, inicio: '08:00:00', fin: '12:00:00' }, // Lunes
          { dia: 3, inicio: '14:00:00', fin: '18:00:00' }, // Miércoles
          { dia: 6, inicio: '09:00:00', fin: '14:00:00' }, // Sábado
        ],
      },
      {
        correo: 'gsalazar@clinica.com',
        nombres: 'Gabriel Antonio',
        apellidos: 'Salazar Pineda',
        telefono: '555-0109',
        disponibilidad: [
          { dia: 2, inicio: '13:00:00', fin: '18:00:00' }, // Martes
          { dia: 4, inicio: '13:00:00', fin: '18:00:00' }, // Jueves
          { dia: 5, inicio: '09:00:00', fin: '14:00:00' }, // Viernes
        ],
      },
      {
        correo: 'afuentes@clinica.com',
        nombres: 'Andrea Gabriela',
        apellidos: 'Fuentes Cordero',
        telefono: '555-0110',
        disponibilidad: [
          { dia: 1, inicio: '08:00:00', fin: '13:00:00' }, // Lunes
          { dia: 3, inicio: '09:00:00', fin: '14:00:00' }, // Miércoles
          { dia: 5, inicio: '14:00:00', fin: '18:00:00' }, // Viernes
        ],
      },
      {
        correo: 'hramirez@clinica.com',
        nombres: 'Héctor Manuel',
        apellidos: 'Ramírez Ordóñez',
        telefono: '555-0111',
        disponibilidad: [
          { dia: 2, inicio: '08:00:00', fin: '14:00:00' }, // Martes
          { dia: 4, inicio: '08:00:00', fin: '14:00:00' }, // Jueves
          { dia: 6, inicio: '08:00:00', fin: '13:00:00' }, // Sábado
        ],
      },
    ];

    console.log(`[SEED] Registrando ${profesionalesData.length} profesionales clínicos...`);
    const profIds = [];

    for (const p of profesionalesData) {
      const uRes = await client.query(
        `INSERT INTO usuario (id_rol, correo, password_hash, estado)
         VALUES (2, $1, $2, 'ACTIVO')
         ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id_usuario`,
        [p.correo, profPassHash]
      );
      const uId = uRes.rows[0].id_usuario;

      const profRes = await client.query(
        `INSERT INTO profesional (id_usuario, nombres, apellidos, telefono, estado)
         VALUES ($1, $2, $3, $4, 'ACTIVO')
         ON CONFLICT (id_usuario) DO UPDATE SET
           nombres = EXCLUDED.nombres,
           apellidos = EXCLUDED.apellidos,
           telefono = EXCLUDED.telefono,
           estado = 'ACTIVO'
         RETURNING id_profesional`,
        [uId, p.nombres, p.apellidos, p.telefono]
      );
      const prId = profRes.rows[0].id_profesional;
      profIds.push(prId);

      // Disponibilidad horaria
      await client.query('DELETE FROM disponibilidad WHERE id_profesional = $1', [prId]);
      for (const d of p.disponibilidad) {
        await client.query(
          `INSERT INTO disponibilidad (id_profesional, dia_semana, hora_inicio, hora_fin, activo)
           VALUES ($1, $2, $3, $4, TRUE)`,
          [prId, d.dia, d.inicio, d.fin]
        );
      }
    }
    console.log(`[SEED] ✓ ${profesionalesData.length} profesionales y sus franjas horarias registradas.`);

    // ========================================================
    // 4. PACIENTES (7 Pacientes: 4 Adultos + 3 Menores con Tutores)
    // ========================================================
    const pacientesData = [
      // Adulto 1
      {
        correo: 'paciente@gmail.com',
        es_menor: false,
        nombres: 'Ana María',
        apellidos: 'Martínez Ruiz',
        fecha_nacimiento: '1998-05-14', // 28 años
        telefono: '555-0201',
        estado: 'ACTIVO',
        motivo: 'Solicitud para manejo de ansiedad y técnicas de estudio',
      },
      // Adulto 2
      {
        correo: 'dramos@gmail.com',
        es_menor: false,
        nombres: 'Diego Fernando',
        apellidos: 'Ramos Cabrera',
        fecha_nacimiento: '1992-08-20', // 34 años
        telefono: '555-0202',
        estado: 'ACTIVO',
        motivo: 'Estrés laboral y dificultades en gestión de hábitos de descanso',
      },
      // Adulto 3
      {
        correo: 'valeriapineda@yahoo.com',
        es_menor: false,
        nombres: 'Valeria Sofía',
        apellidos: 'Pineda Gómez',
        fecha_nacimiento: '2003-03-11', // 23 años
        telefono: '555-0203',
        estado: 'EN_ESPERA',
        motivo: 'Acompañamiento en autoestima, autoconocimiento y límites interpersonales',
      },
      // Adulto 4
      {
        correo: 'jcastillo@gmail.com',
        es_menor: false,
        nombres: 'Javier Eduardo',
        apellidos: 'Castillo Mendoza',
        fecha_nacimiento: '1981-10-09', // 45 años
        telefono: '555-0204',
        estado: 'SOLICITANTE',
        motivo: 'Proceso de duelo familiar y resolución de conflictos',
      },
      // Menor 1 (9 años) con Tutor Legal
      {
        correo: 'carmen.morales@gmail.com', // Correo del tutor legal para acceso
        es_menor: true,
        nombres: 'Mateo Sebastián',
        apellidos: 'López Morales',
        fecha_nacimiento: '2017-06-15', // 9 años
        telefono: '555-0301',
        estado: 'ACTIVO',
        motivo: 'Dificultades en concentración escolar y regulación emocional en el aula',
        tutor: {
          nombres: 'Carmen Elena',
          apellidos: 'Morales de López',
          parentesco: 'Madre',
          telefono: '555-0301',
          correo: 'carmen.morales@gmail.com',
        },
      },
      // Menor 2 (14 años) con Tutor Legal
      {
        correo: 'jorge.soto@hotmail.com', // Correo del tutor legal para acceso
        es_menor: true,
        nombres: 'Lucía Valentina',
        apellidos: 'Soto Estrada',
        fecha_nacimiento: '2012-11-04', // 14 años
        telefono: '555-0302',
        estado: 'ACTIVO',
        motivo: 'Acompañamiento psicoemocional por proceso de separación parental',
        tutor: {
          nombres: 'Jorge Mario',
          apellidos: 'Soto Alvarado',
          parentesco: 'Padre',
          telefono: '555-0302',
          correo: 'jorge.soto@hotmail.com',
        },
      },
      // Menor 3 (6 años) con Tutor Legal
      {
        correo: 'silvia.ruiz@gmail.com', // Correo del tutor legal para acceso
        es_menor: true,
        nombres: 'Emilio José',
        apellidos: 'Hernández Ruiz',
        fecha_nacimiento: '2020-02-18', // 6 años
        telefono: '555-0303',
        estado: 'SOLICITANTE',
        motivo: 'Adaptación a entorno escolar y manejo de miedos infantiles',
        tutor: {
          nombres: 'Silvia Patricia',
          apellidos: 'Ruiz Méndez',
          parentesco: 'Abuela (Tutor Legal)',
          telefono: '555-0303',
          correo: 'silvia.ruiz@gmail.com',
        },
      },
    ];

    console.log(`[SEED] Registrando ${pacientesData.length} pacientes (adultos y menores con tutores)...`);
    const pacIds = [];

    for (const pac of pacientesData) {
      const uRes = await client.query(
        `INSERT INTO usuario (id_rol, correo, password_hash, estado)
         VALUES (3, $1, $2, 'ACTIVO')
         ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id_usuario`,
        [pac.correo, pacPassHash]
      );
      const uId = uRes.rows[0].id_usuario;

      const pacRes = await client.query(
        `INSERT INTO paciente (id_usuario, nombres, apellidos, fecha_nacimiento, telefono, estado)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id_usuario) DO UPDATE SET
           nombres = EXCLUDED.nombres,
           apellidos = EXCLUDED.apellidos,
           fecha_nacimiento = EXCLUDED.fecha_nacimiento,
           telefono = EXCLUDED.telefono,
           estado = EXCLUDED.estado
         RETURNING id_paciente`,
        [uId, pac.nombres, pac.apellidos, pac.fecha_nacimiento, pac.telefono, pac.estado]
      );
      const pId = pacRes.rows[0].id_paciente;
      pacIds.push(pId);

      // Si es menor o tiene tutor legal
      if (pac.tutor) {
        await client.query('DELETE FROM responsable WHERE id_paciente = $1', [pId]);
        await client.query(
          `INSERT INTO responsable (id_paciente, nombres, apellidos, parentesco, telefono, correo)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [pId, pac.tutor.nombres, pac.tutor.apellidos, pac.tutor.parentesco, pac.tutor.telefono, pac.tutor.correo]
        );
      }

      // Solicitud de atención inicial si no existe
      const solCheck = await client.query('SELECT id_solicitud FROM solicitud_atencion WHERE id_paciente = $1', [pId]);
      if (solCheck.rowCount === 0) {
        await client.query(
          `INSERT INTO solicitud_atencion (id_paciente, motivo_consulta, estado)
           VALUES ($1, $2, 'PENDIENTE')`,
          [pId, pac.motivo]
        );
      }
    }
    console.log(`[SEED] ✓ ${pacientesData.length} pacientes registrados con solicitudes y tutores legales.`);

    // ========================================================
    // 5. VINCULACIONES INICIALES ENTRE TERAPEUTAS Y PACIENTES
    // ========================================================
    // Vincular Paciente 1 (Ana Martínez) con Profesional 1 (Carlos Pérez)
    const vinc1Check = await client.query(
      `SELECT id_vinculacion FROM vinculacion WHERE id_paciente = $1 AND id_profesional = $2`,
      [pacIds[0], profIds[0]]
    );
    if (vinc1Check.rowCount === 0) {
      await client.query(
        `INSERT INTO vinculacion (id_paciente, id_profesional, estado, origen, creado_por)
         VALUES ($1, $2, 'ACTIVA', 'SELECCION_PACIENTE', $3)`,
        [pacIds[0], profIds[0], adminId]
      );
    }

    // Vincular Paciente 2 (Diego Ramos) con Profesional 2 (María Vásquez)
    const vinc2Check = await client.query(
      `SELECT id_vinculacion FROM vinculacion WHERE id_paciente = $1 AND id_profesional = $2`,
      [pacIds[1], profIds[1]]
    );
    if (vinc2Check.rowCount === 0) {
      await client.query(
        `INSERT INTO vinculacion (id_paciente, id_profesional, estado, origen, creado_por)
         VALUES ($1, $2, 'ACTIVA', 'SELECCION_PACIENTE', $3)`,
        [pacIds[1], profIds[1], adminId]
      );
    }

    // Vincular Paciente 5 (Mateo López - menor) con Profesional 3 (Alejandro Méndez - infanto-juvenil)
    const vinc3Check = await client.query(
      `SELECT id_vinculacion FROM vinculacion WHERE id_paciente = $1 AND id_profesional = $2`,
      [pacIds[4], profIds[2]]
    );
    if (vinc3Check.rowCount === 0) {
      await client.query(
        `INSERT INTO vinculacion (id_paciente, id_profesional, estado, origen, creado_por)
         VALUES ($1, $2, 'ACTIVA', 'ASIGNACION_ADMINISTRATIVA', $3)`,
        [pacIds[4], profIds[2], adminId]
      );
    }

    console.log('[SEED] ✓ Vinculaciones iniciales establecidas.');

    // ========================================================
    // 6. PLANES DE SEGUIMIENTO Y HORARIOS INICIALES
    // ========================================================
    console.log('[SEED] Creando planes de seguimiento terapéutico...');
    // Obtener las vinculaciones creadas
    const vinc1 = (await client.query(`SELECT id_vinculacion FROM vinculacion WHERE id_paciente = $1 AND id_profesional = $2`, [pacIds[0], profIds[0]])).rows[0];
    const vinc2 = (await client.query(`SELECT id_vinculacion FROM vinculacion WHERE id_paciente = $1 AND id_profesional = $2`, [pacIds[1], profIds[1]])).rows[0];
    const vinc3 = (await client.query(`SELECT id_vinculacion FROM vinculacion WHERE id_paciente = $1 AND id_profesional = $2`, [pacIds[4], profIds[2]])).rows[0];

    let plan1Id, plan3Id;

    if (vinc1) {
      let plan1Res = await client.query(`SELECT id_plan_seguimiento FROM plan_seguimiento WHERE id_vinculacion = $1`, [vinc1.id_vinculacion]);
      if (plan1Res.rowCount === 0) {
        plan1Res = await client.query(
          `INSERT INTO plan_seguimiento (id_vinculacion, frecuencia, fecha_inicio, estado)
           VALUES ($1, 'SEMANAL', CURRENT_DATE - INTERVAL '14 days', 'ACTIVO')
           RETURNING id_plan_seguimiento`,
          [vinc1.id_vinculacion]
        );
        plan1Id = plan1Res.rows[0].id_plan_seguimiento;
        await client.query(
          `INSERT INTO horario_seguimiento (id_plan_seguimiento, dia_semana, hora_inicio, duracion_minutos, activo)
           VALUES ($1, 1, '09:00:00', 60, TRUE), ($1, 3, '10:00:00', 60, TRUE)`,
          [plan1Id]
        );
      } else {
        plan1Id = plan1Res.rows[0].id_plan_seguimiento;
      }
    }

    if (vinc3) {
      let plan3Res = await client.query(`SELECT id_plan_seguimiento FROM plan_seguimiento WHERE id_vinculacion = $1`, [vinc3.id_vinculacion]);
      if (plan3Res.rowCount === 0) {
        plan3Res = await client.query(
          `INSERT INTO plan_seguimiento (id_vinculacion, frecuencia, fecha_inicio, estado)
           VALUES ($1, 'QUINCENAL', CURRENT_DATE - INTERVAL '7 days', 'ACTIVO')
           RETURNING id_plan_seguimiento`,
          [vinc3.id_vinculacion]
        );
        plan3Id = plan3Res.rows[0].id_plan_seguimiento;
        await client.query(
          `INSERT INTO horario_seguimiento (id_plan_seguimiento, dia_semana, hora_inicio, duracion_minutos, activo)
           VALUES ($1, 2, '15:00:00', 60, TRUE)`,
          [plan3Id]
        );
      } else {
        plan3Id = plan3Res.rows[0].id_plan_seguimiento;
      }
    }
    console.log('[SEED] ✓ Planes de seguimiento configurados.');

    // ========================================================
    // 7. CITAS PROGRAMADAS Y ASISTENCIAS DE DEMOSTRACIÓN
    // ========================================================
    console.log('[SEED] Configurando citas de prueba (hoy, próximas y pasadas)...');
    const espRes = await client.query('SELECT id_espacio, nombre FROM espacio ORDER BY id_espacio ASC');
    const esp1 = espRes.rows[0]?.id_espacio;
    const esp2 = espRes.rows[1]?.id_espacio;
    const esp3 = espRes.rows[2]?.id_espacio;

    // Obtener id_usuario de profesional 1 para registrar asistencias
    const prof1UserRes = await client.query('SELECT id_usuario FROM profesional WHERE id_profesional = $1', [profIds[0]]);
    const prof1UserId = prof1UserRes.rows[0]?.id_usuario || adminId;

    // Cita 1: HOY a las 10:00 AM - Dr. Carlos Pérez con Ana Martínez (PROGRAMADA - Lista para registrar asistencia)
    const checkCitaHoy1 = await client.query(
      `SELECT id_cita FROM cita WHERE id_profesional = $1 AND id_paciente = $2 AND estado = 'PROGRAMADA' AND DATE(fecha_hora_inicio) = CURRENT_DATE`,
      [profIds[0], pacIds[0]]
    );
    if (checkCitaHoy1.rowCount === 0) {
      await client.query(
        `INSERT INTO cita (id_paciente, id_profesional, id_espacio, id_plan_seguimiento, creado_por, fecha_hora_inicio, fecha_hora_fin, tipo, estado)
         VALUES ($1, $2, $3, $4, $5, 
                 CURRENT_DATE + TIME '10:00:00', 
                 CURRENT_DATE + TIME '11:00:00', 
                 'SEGUIMIENTO', 'PROGRAMADA')`,
        [pacIds[0], profIds[0], esp1, plan1Id, adminId]
      );
    }

    // Cita 2: HOY a las 16:00 PM - Dr. Alejandro Méndez con Mateo López (menor con tutor) (PROGRAMADA)
    const checkCitaHoy2 = await client.query(
      `SELECT id_cita FROM cita WHERE id_profesional = $1 AND id_paciente = $2 AND estado = 'PROGRAMADA' AND DATE(fecha_hora_inicio) = CURRENT_DATE`,
      [profIds[2], pacIds[4]]
    );
    if (checkCitaHoy2.rowCount === 0) {
      await client.query(
        `INSERT INTO cita (id_paciente, id_profesional, id_espacio, id_plan_seguimiento, creado_por, fecha_hora_inicio, fecha_hora_fin, tipo, estado)
         VALUES ($1, $2, $3, $4, $5, 
                 CURRENT_DATE + TIME '16:00:00', 
                 CURRENT_DATE + TIME '17:00:00', 
                 'SEGUIMIENTO', 'PROGRAMADA')`,
        [pacIds[4], profIds[2], esp3, plan3Id, adminId]
      );
    }

    // Cita 3: MAÑANA a las 11:00 AM - Dra. María Elena Vásquez con Diego Ramos (PROGRAMADA)
    const checkCitaManana = await client.query(
      `SELECT id_cita FROM cita WHERE id_profesional = $1 AND id_paciente = $2 AND estado = 'PROGRAMADA' AND DATE(fecha_hora_inicio) = CURRENT_DATE + INTERVAL '1 day'`,
      [profIds[1], pacIds[1]]
    );
    if (checkCitaManana.rowCount === 0) {
      await client.query(
        `INSERT INTO cita (id_paciente, id_profesional, id_espacio, creado_por, fecha_hora_inicio, fecha_hora_fin, tipo, estado)
         VALUES ($1, $2, $3, $4, 
                 CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00', 
                 CURRENT_DATE + INTERVAL '1 day' + TIME '12:00:00', 
                 'INICIAL', 'PROGRAMADA')`,
        [pacIds[1], profIds[1], esp2, adminId]
      );
    }

    // Cita 4: PASADA (hace 3 días) - Dr. Carlos Pérez con Ana Martínez (REALIZADA con ASISTENCIA registrada)
    const checkCitaPasada1 = await client.query(
      `SELECT id_cita FROM cita WHERE id_profesional = $1 AND id_paciente = $2 AND estado = 'REALIZADA'`,
      [profIds[0], pacIds[0]]
    );
    if (checkCitaPasada1.rowCount === 0) {
      const cRes = await client.query(
        `INSERT INTO cita (id_paciente, id_profesional, id_espacio, id_plan_seguimiento, creado_por, fecha_hora_inicio, fecha_hora_fin, tipo, estado)
         VALUES ($1, $2, $3, $4, $5, 
                 CURRENT_DATE - INTERVAL '3 days' + TIME '09:00:00', 
                 CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00', 
                 'SEGUIMIENTO', 'REALIZADA')
         RETURNING id_cita`,
        [pacIds[0], profIds[0], esp1, plan1Id, adminId]
      );
      const cId = cRes.rows[0].id_cita;
      await client.query(
        `INSERT INTO asistencia (id_cita, estado, tipo_inasistencia, registrado_por)
         VALUES ($1, 'ASISTIO', NULL, $2)
         ON CONFLICT (id_cita) DO NOTHING`,
        [cId, prof1UserId]
      );
    }

    // Cita 5: PASADA (hace 5 días) - Dr. Carlos Pérez con Sofía Castillo (INASISTENCIA JUSTIFICADA)
    const checkCitaPasada2 = await client.query(
      `SELECT id_cita FROM cita WHERE id_profesional = $1 AND id_paciente = $2 AND estado = 'INASISTENCIA'`,
      [profIds[0], pacIds[2]]
    );
    if (checkCitaPasada2.rowCount === 0) {
      const cRes2 = await client.query(
        `INSERT INTO cita (id_paciente, id_profesional, id_espacio, creado_por, fecha_hora_inicio, fecha_hora_fin, tipo, estado)
         VALUES ($1, $2, $3, $4, 
                 CURRENT_DATE - INTERVAL '5 days' + TIME '14:00:00', 
                 CURRENT_DATE - INTERVAL '5 days' + TIME '15:00:00', 
                 'INICIAL', 'INASISTENCIA')
         RETURNING id_cita`,
        [pacIds[2], profIds[0], esp1, adminId]
      );
      const cId2 = cRes2.rows[0].id_cita;
      await client.query(
        `INSERT INTO asistencia (id_cita, estado, tipo_inasistencia, registrado_por)
         VALUES ($1, 'NO_ASISTIO', 'JUSTIFICADA', $2)
         ON CONFLICT (id_cita) DO NOTHING`,
        [cId2, prof1UserId]
      );
    }
    console.log('[SEED] ✓ Citas y asistencias de demostración registradas.');

    await client.query('COMMIT');
    console.log('========================================================');
    console.log('[SEED] ¡BASE DE DATOS INICIALIZADA EXITOSAMENTE!');
    console.log(`[SEED] Total profesionales en plataforma: ${profesionalesData.length}`);
    console.log(`[SEED] Total pacientes en plataforma: ${pacientesData.length}`);
    console.log('========================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED] Error crítico insertando datos semilla:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
