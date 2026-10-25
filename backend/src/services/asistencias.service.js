const { query, pool } = require('../config/database');
const seguimientoService = require('./seguimiento.service');

class AsistenciasService {
  async registrar({ id_cita, estado, tipo_inasistencia }, user) {
    if (!['ASISTIO', 'NO_ASISTIO'].includes(estado)) {
      const err = new Error("El estado debe ser 'ASISTIO' o 'NO_ASISTIO'.");
      err.statusCode = 400;
      throw err;
    }

    if (estado === 'NO_ASISTIO' && !['JUSTIFICADA', 'INJUSTIFICADA'].includes(tipo_inasistencia)) {
      const err = new Error("Para inasistencia debe especificar 'JUSTIFICADA' o 'INJUSTIFICADA'.");
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Consultar la cita
      const citaRes = await client.query('SELECT * FROM cita WHERE id_cita = $1', [id_cita]);
      if (citaRes.rowCount === 0) {
        const err = new Error('Cita no encontrada');
        err.statusCode = 404;
        throw err;
      }
      const cita = citaRes.rows[0];

      // Insertar o actualizar asistencia
      const insertAsistSql = `
        INSERT INTO asistencia (id_cita, estado, tipo_inasistencia, registrado_por)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id_cita) DO UPDATE SET
          estado = EXCLUDED.estado,
          tipo_inasistencia = EXCLUDED.tipo_inasistencia,
          registrado_por = EXCLUDED.registrado_por,
          fecha_registro = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const asistRes = await client.query(insertAsistSql, [
        id_cita,
        estado,
        estado === 'NO_ASISTIO' ? tipo_inasistencia : null,
        user.id_usuario,
      ]);
      const asistencia = asistRes.rows[0];

      // Actualizar estado de la cita
      const nuevoEstadoCita = estado === 'ASISTIO' ? 'REALIZADA' : 'INASISTENCIA';
      await client.query(
        `UPDATE cita
         SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_cita = $2`,
        [nuevoEstadoCita, id_cita]
      );

      // Si fue cita inicial y asistió, vincular formalmente al paciente con el profesional
      if (cita.tipo === 'INICIAL' && estado === 'ASISTIO') {
        // Verificar si ya existe vinculación activa
        const checkVinc = await client.query(
          `SELECT id_vinculacion FROM vinculacion
           WHERE id_paciente = $1 AND id_profesional = $2 AND estado = 'ACTIVA'`,
          [cita.id_paciente, cita.id_profesional]
        );

        if (checkVinc.rowCount === 0) {
          await client.query(
            `INSERT INTO vinculacion (id_paciente, id_profesional, origen, creado_por, estado)
             VALUES ($1, $2, 'SELECCION_PACIENTE', $3, 'ACTIVA')`,
            [cita.id_paciente, cita.id_profesional, user.id_usuario]
          );
        }

        // Actualizar paciente a ACTIVO
        await client.query(`UPDATE paciente SET estado = 'ACTIVO' WHERE id_paciente = $1`, [cita.id_paciente]);
      }

      // Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'ASISTENCIA_REGISTRADA', 'Resultado administrativo de cita registrado', $3)`,
        [
          cita.id_paciente,
          user.id_usuario,
          JSON.stringify({
            id_cita,
            estado_asistencia: estado,
            tipo_inasistencia,
          }),
        ]
      );

      await client.query('COMMIT');
      return asistencia;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAll(filtros = {}) {
    let sql = `
      SELECT a.*, c.fecha_hora_inicio, c.fecha_hora_fin, c.tipo AS tipo_cita,
             pac.nombres AS pac_nombres, pac.apellidos AS pac_apellidos,
             prof.nombres AS prof_nombres, prof.apellidos AS prof_apellidos
      FROM asistencia a
      JOIN cita c ON a.id_cita = c.id_cita
      JOIN paciente pac ON c.id_paciente = pac.id_paciente
      JOIN profesional prof ON c.id_profesional = prof.id_profesional
      WHERE 1=1
    `;
    const params = [];
    if (filtros.id_profesional) {
      params.push(filtros.id_profesional);
      sql += ` AND c.id_profesional = $${params.length}`;
    }
    if (filtros.estado) {
      params.push(filtros.estado);
      sql += ` AND a.estado = $${params.length}`;
    }
    sql += ' ORDER BY a.fecha_registro DESC';
    const res = await query(sql, params);
    return res.rows;
  }
}

module.exports = new AsistenciasService();
