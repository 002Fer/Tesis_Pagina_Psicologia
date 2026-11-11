const { query, pool } = require('../config/database');

class CitasService {
  /**
   * Valida si existe traslape o conflicto de horarios para paciente, profesional o espacio.
   * Regla de superposición: (inicio_existente < nuevo_fin AND fin_existente > nuevo_inicio)
   * Se excluyen citas con estado CANCELADA o REPROGRAMADA.
   */
  async validarConflictos(client, { id_paciente, id_profesional, id_espacio, fecha_hora_inicio, fecha_hora_fin, excludeCitaId = null }) {
    // 1. Conflicto para el PROFESIONAL
    let profConflictSql = `
      SELECT id_cita FROM cita
      WHERE id_profesional = $1
        AND estado NOT IN ('CANCELADA', 'REPROGRAMADA')
        AND fecha_hora_inicio < $3
        AND fecha_hora_fin > $2
    `;
    const profParams = [id_profesional, fecha_hora_inicio, fecha_hora_fin];
    if (excludeCitaId) {
      profParams.push(excludeCitaId);
      profConflictSql += ` AND id_cita != $4`;
    }
    const profRes = await client.query(profConflictSql, profParams);
    if (profRes.rowCount > 0) {
      const err = new Error('El profesional ya cuenta con una cita programada en este horario.');
      err.statusCode = 409;
      throw err;
    }

    // 2. Conflicto para el PACIENTE
    let pacConflictSql = `
      SELECT id_cita FROM cita
      WHERE id_paciente = $1
        AND estado NOT IN ('CANCELADA', 'REPROGRAMADA')
        AND fecha_hora_inicio < $3
        AND fecha_hora_fin > $2
    `;
    const pacParams = [id_paciente, fecha_hora_inicio, fecha_hora_fin];
    if (excludeCitaId) {
      pacParams.push(excludeCitaId);
      pacConflictSql += ` AND id_cita != $4`;
    }
    const pacRes = await client.query(pacConflictSql, pacParams);
    if (pacRes.rowCount > 0) {
      const err = new Error('El paciente ya cuenta con una cita programada en este horario.');
      err.statusCode = 409;
      throw err;
    }

    // 3. Conflicto para el ESPACIO (si se especificó)
    if (id_espacio) {
      let espConflictSql = `
        SELECT id_cita FROM cita
        WHERE id_espacio = $1
          AND estado NOT IN ('CANCELADA', 'REPROGRAMADA')
          AND fecha_hora_inicio < $3
          AND fecha_hora_fin > $2
      `;
      const espParams = [id_espacio, fecha_hora_inicio, fecha_hora_fin];
      if (excludeCitaId) {
        espParams.push(excludeCitaId);
        espConflictSql += ` AND id_cita != $4`;
      }
      const espRes = await client.query(espConflictSql, espParams);
      if (espRes.rowCount > 0) {
        const err = new Error('El espacio seleccionado se encuentra ocupado en este horario.');
        err.statusCode = 409;
        throw err;
      }
    }
  }

  async getAll(user, filtros = {}) {
    let sql = `
      SELECT c.*,
             pac.nombres AS pac_nombres, pac.apellidos AS pac_apellidos, pac.telefono AS pac_telefono,
             prof.nombres AS prof_nombres, prof.apellidos AS prof_apellidos,
             esp.nombre AS espacio_nombre,
             a.estado AS asistencia_estado, a.tipo_inasistencia
      FROM cita c
      JOIN paciente pac ON c.id_paciente = pac.id_paciente
      JOIN profesional prof ON c.id_profesional = prof.id_profesional
      LEFT JOIN espacio esp ON c.id_espacio = esp.id_espacio
      LEFT JOIN asistencia a ON a.id_cita = c.id_cita
      WHERE 1=1
    `;
    const params = [];

    // Filtros de rol
    if (user.rol === 'PACIENTE') {
      let pacId = user.id_paciente;
      if (!pacId) {
        const pacLookup = await query('SELECT id_paciente FROM paciente WHERE id_usuario = $1', [user.id_usuario]);
        if (pacLookup.rowCount > 0) pacId = Number(pacLookup.rows[0].id_paciente);
      }
      if (pacId) {
        params.push(pacId);
        sql += ` AND c.id_paciente = $${params.length}`;
      } else {
        return [];
      }
    } else if (user.rol === 'PROFESIONAL') {
      let profId = user.id_profesional;
      if (!profId) {
        const profLookup = await query('SELECT id_profesional FROM profesional WHERE id_usuario = $1', [user.id_usuario]);
        if (profLookup.rowCount > 0) profId = Number(profLookup.rows[0].id_profesional);
      }
      if (profId) {
        params.push(profId);
        sql += ` AND c.id_profesional = $${params.length}`;
      } else {
        return [];
      }
    }

    if (filtros.id_paciente && user.rol !== 'PACIENTE') {
      params.push(filtros.id_paciente);
      sql += ` AND c.id_paciente = $${params.length}`;
    }
    if (filtros.id_profesional && user.rol === 'ADMINISTRADOR') {
      params.push(filtros.id_profesional);
      sql += ` AND c.id_profesional = $${params.length}`;
    }
    if (filtros.estado) {
      params.push(filtros.estado);
      sql += ` AND c.estado = $${params.length}`;
    }
    if (filtros.tipo) {
      params.push(filtros.tipo);
      sql += ` AND c.tipo = $${params.length}`;
    }
    if (filtros.fecha) {
      params.push(filtros.fecha);
      sql += ` AND DATE(c.fecha_hora_inicio AT TIME ZONE 'UTC') = $${params.length}::date`;
    }
    if (filtros.search) {
      params.push(`%${filtros.search.toLowerCase().trim()}%`);
      sql += ` AND (
        LOWER(prof.nombres) LIKE $${params.length} OR
        LOWER(prof.apellidos) LIKE $${params.length} OR
        LOWER(pac.nombres) LIKE $${params.length} OR
        LOWER(pac.apellidos) LIKE $${params.length} OR
        LOWER(COALESCE(esp.nombre, '')) LIKE $${params.length} OR
        CAST(c.id_cita AS TEXT) LIKE $${params.length}
      )`;
    }

    sql += ' ORDER BY c.fecha_hora_inicio ASC';
    const res = await query(sql, params);
    return res.rows;
  }

  async getById(id, user) {
    const sql = `
      SELECT c.*,
             pac.nombres AS pac_nombres, pac.apellidos AS pac_apellidos, pac.telefono AS pac_telefono,
             prof.nombres AS prof_nombres, prof.apellidos AS prof_apellidos,
             esp.nombre AS espacio_nombre, esp.ubicacion AS espacio_ubicacion,
             a.id_asistencia, a.estado AS asistencia_estado, a.tipo_inasistencia
      FROM cita c
      JOIN paciente pac ON c.id_paciente = pac.id_paciente
      JOIN profesional prof ON c.id_profesional = prof.id_profesional
      LEFT JOIN espacio esp ON c.id_espacio = esp.id_espacio
      LEFT JOIN asistencia a ON a.id_cita = c.id_cita
      WHERE c.id_cita = $1
    `;
    const res = await query(sql, [id]);
    if (res.rowCount === 0) {
      const err = new Error('Cita no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const cita = res.rows[0];

    // Validar autorización
    if (user.rol === 'PACIENTE' && user.id_paciente !== Number(cita.id_paciente)) {
      const err = new Error('Acceso no autorizado a esta cita.');
      err.statusCode = 403;
      throw err;
    }
    if (user.rol === 'PROFESIONAL' && user.id_profesional !== Number(cita.id_profesional)) {
      const err = new Error('Acceso no autorizado a citas de otro profesional.');
      err.statusCode = 403;
      throw err;
    }

    return cita;
  }

  /**
   * Creación de una nueva cita con validación concurrente y transaccional
   */
  async create({ id_paciente, id_profesional, id_espacio = null, id_plan_seguimiento = null, fecha_hora_inicio, fecha_hora_fin, tipo = 'INICIAL' }, user) {
    // Validar coherencia de fechas
    const inicio = new Date(fecha_hora_inicio);
    const fin = new Date(fecha_hora_fin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) {
      const err = new Error('La fecha y hora de fin debe ser posterior a la fecha y hora de inicio.');
      err.statusCode = 400;
      throw err;
    }

    // Si es un PACIENTE agendando, el id_paciente debe ser el suyo
    let pacienteIdFinal = id_paciente;
    if (user.rol === 'PACIENTE') {
      pacienteIdFinal = user.id_paciente;
      if (!pacienteIdFinal) {
        const pRes = await query('SELECT id_paciente FROM paciente WHERE id_usuario = $1', [user.id_usuario]);
        if (pRes.rowCount > 0) pacienteIdFinal = Number(pRes.rows[0].id_paciente);
      }
      if (!pacienteIdFinal && id_paciente) {
        pacienteIdFinal = Number(id_paciente);
      }
    }
    if (!pacienteIdFinal) {
      const err = new Error('Identificador de paciente no válido.');
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Validar profesional activo
      const profCheck = await client.query('SELECT estado FROM profesional WHERE id_profesional = $1', [id_profesional]);
      if (profCheck.rowCount === 0 || profCheck.rows[0].estado !== 'ACTIVO') {
        const err = new Error('El profesional no se encuentra disponible o activo.');
        err.statusCode = 400;
        throw err;
      }

      // 2. Si no se especificó espacio, intentar autoasignar un espacio DISPONIBLE
      let espacioAsignado = id_espacio;
      if (!espacioAsignado) {
        const espQuery = `
          SELECT id_espacio FROM espacio
          WHERE estado = 'DISPONIBLE'
            AND id_espacio NOT IN (
              SELECT DISTINCT id_espacio FROM cita
              WHERE id_espacio IS NOT NULL
                AND estado NOT IN ('CANCELADA', 'REPROGRAMADA')
                AND fecha_hora_inicio < $2
                AND fecha_hora_fin > $1
            )
          ORDER BY id_espacio ASC
          LIMIT 1
        `;
        const espAvail = await client.query(espQuery, [fecha_hora_inicio, fecha_hora_fin]);
        if (espAvail.rowCount > 0) {
          espacioAsignado = espAvail.rows[0].id_espacio;
        }
      }

      // 3. Validación de conflictos bajo la transacción
      await this.validarConflictos(client, {
        id_paciente: pacienteIdFinal,
        id_profesional,
        id_espacio: espacioAsignado,
        fecha_hora_inicio,
        fecha_hora_fin,
      });

      // 4. Insertar cita
      const insertSql = `
        INSERT INTO cita (
          id_paciente, id_profesional, id_espacio, id_plan_seguimiento,
          creado_por, fecha_hora_inicio, fecha_hora_fin, tipo, estado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PROGRAMADA')
        RETURNING *
      `;
      const citaRes = await client.query(insertSql, [
        pacienteIdFinal,
        id_profesional,
        espacioAsignado,
        id_plan_seguimiento,
        user.id_usuario,
        fecha_hora_inicio,
        fecha_hora_fin,
        tipo,
      ]);
      const nuevaCita = citaRes.rows[0];

      // 5. Si es cita inicial y el paciente estaba en SOLICITANTE, pasarlo a EN_ESPERA
      await client.query(
        `UPDATE paciente
         SET estado = 'EN_ESPERA', fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_paciente = $1 AND estado = 'SOLICITANTE'`,
        [pacienteIdFinal]
      );

      // 6. Registrar en historial administrativo
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'CITA_PROGRAMADA', 'Cita programada con profesional', $3)`,
        [
          pacienteIdFinal,
          user.id_usuario,
          JSON.stringify({
            id_cita: nuevaCita.id_cita,
            id_profesional,
            fecha_hora_inicio,
            tipo,
          }),
        ]
      );

      await client.query('COMMIT');
      return nuevaCita;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Cancelar cita (Sección 20, 44 del plan)
   */
  async cancelar(idCita, motivo_cancelacion, user) {
    const cita = await this.getById(idCita, user);

    if (cita.estado === 'CANCELADA' || cita.estado === 'REALIZADA') {
      const err = new Error(`No se puede cancelar una cita con estado ${cita.estado}.`);
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateSql = `
        UPDATE cita
        SET estado = 'CANCELADA',
            motivo_cancelacion = $2,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_cita = $1
        RETURNING *
      `;
      const res = await client.query(updateSql, [idCita, motivo_cancelacion || 'Cancelada por el usuario']);

      // Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'CITA_CANCELADA', 'Cita cancelada', $3)`,
        [cita.id_paciente, user.id_usuario, JSON.stringify({ id_cita: idCita, motivo: motivo_cancelacion })]
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Reprogramar cita conservando trazabilidad (Sección 21 del plan)
   */
  async reprogramar(idCita, { nueva_fecha_hora_inicio, nueva_fecha_hora_fin, id_espacio = null }, user) {
    const citaOriginal = await this.getById(idCita, user);

    if (['CANCELADA', 'REALIZADA', 'REPROGRAMADA'].includes(citaOriginal.estado)) {
      const err = new Error(`No es posible reprogramar una cita con estado ${citaOriginal.estado}.`);
      err.statusCode = 400;
      throw err;
    }

    const inicio = new Date(nueva_fecha_hora_inicio);
    const fin = new Date(nueva_fecha_hora_fin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin <= inicio) {
      const err = new Error('Horario de reprogramación inválido.');
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Validar conflictos para el nuevo horario
      const espacioFinal = id_espacio || citaOriginal.id_espacio;
      await this.validarConflictos(client, {
        id_paciente: citaOriginal.id_paciente,
        id_profesional: citaOriginal.id_profesional,
        id_espacio: espacioFinal,
        fecha_hora_inicio: nueva_fecha_hora_inicio,
        fecha_hora_fin: nueva_fecha_hora_fin,
        excludeCitaId: citaOriginal.id_cita,
      });

      // 2. Marcar la cita original como REPROGRAMADA
      await client.query(
        `UPDATE cita
         SET estado = 'REPROGRAMADA', fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_cita = $1`,
        [idCita]
      );

      // 3. Crear nueva cita enlazada por cita_anterior
      const insertSql = `
        INSERT INTO cita (
          id_paciente, id_profesional, id_espacio, id_plan_seguimiento,
          creado_por, fecha_hora_inicio, fecha_hora_fin, tipo, estado, cita_anterior
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PROGRAMADA', $9)
        RETURNING *
      `;
      const res = await client.query(insertSql, [
        citaOriginal.id_paciente,
        citaOriginal.id_profesional,
        espacioFinal,
        citaOriginal.id_plan_seguimiento,
        user.id_usuario,
        nueva_fecha_hora_inicio,
        nueva_fecha_hora_fin,
        citaOriginal.tipo,
        citaOriginal.id_cita,
      ]);
      const nuevaCita = res.rows[0];

      // 4. Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'CITA_REPROGRAMADA', 'Cita reprogramada a nuevo horario', $3)`,
        [
          citaOriginal.id_paciente,
          user.id_usuario,
          JSON.stringify({
            cita_anterior: idCita,
            nueva_cita: nuevaCita.id_cita,
            nuevo_inicio: nueva_fecha_hora_inicio,
          }),
        ]
      );

      await client.query('COMMIT');
      return nuevaCita;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new CitasService();
