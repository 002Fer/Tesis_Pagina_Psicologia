const { query, pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class ProfesionalesService {
  async getAll(filtros = {}) {
    let sql = `
      SELECT p.id_profesional, p.id_usuario, p.nombres, p.apellidos, p.telefono, p.estado,
             p.fecha_registro, u.correo
      FROM profesional p
      JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE 1=1
    `;
    const params = [];

    if (filtros.estado) {
      params.push(filtros.estado);
      sql += ` AND p.estado = $${params.length}`;
    }

    sql += ' ORDER BY p.apellidos ASC, p.nombres ASC';
    const res = await query(sql, params);
    return res.rows;
  }

  async getById(id) {
    const sql = `
      SELECT p.id_profesional, p.id_usuario, p.nombres, p.apellidos, p.telefono, p.estado,
             p.fecha_registro, u.correo
      FROM profesional p
      JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_profesional = $1
    `;
    const res = await query(sql, [id]);
    if (res.rowCount === 0) {
      const err = new Error('Profesional no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return res.rows[0];
  }

  async create({ correo, password, nombres, apellidos, telefono }) {
    const existing = await query('SELECT id_usuario FROM usuario WHERE correo = $1', [correo.toLowerCase().trim()]);
    if (existing.rowCount > 0) {
      const err = new Error('El correo electrónico ya está registrado.');
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const hash = await bcrypt.hash(password || 'Clinica123*', 10);
      const userRes = await client.query(
        `INSERT INTO usuario (id_rol, correo, password_hash, estado)
         VALUES (2, $1, $2, 'ACTIVO')
         RETURNING id_usuario`,
        [correo.toLowerCase().trim(), hash]
      );
      const userId = userRes.rows[0].id_usuario;

      const profRes = await client.query(
        `INSERT INTO profesional (id_usuario, nombres, apellidos, telefono, estado)
         VALUES ($1, $2, $3, $4, 'ACTIVO')
         RETURNING id_profesional, nombres, apellidos, telefono, estado`,
        [userId, nombres, apellidos, telefono || null]
      );

      await client.query('COMMIT');
      return {
        id_profesional: profRes.rows[0].id_profesional,
        id_usuario: userId,
        correo,
        ...profRes.rows[0],
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id, { nombres, apellidos, telefono, estado }) {
    const fields = [];
    const params = [id];

    if (nombres !== undefined) {
      params.push(nombres);
      fields.push(`nombres = $${params.length}`);
    }
    if (apellidos !== undefined) {
      params.push(apellidos);
      fields.push(`apellidos = $${params.length}`);
    }
    if (telefono !== undefined) {
      params.push(telefono);
      fields.push(`telefono = $${params.length}`);
    }
    if (estado !== undefined) {
      params.push(estado);
      fields.push(`estado = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    const sql = `
      UPDATE profesional
      SET ${fields.join(', ')}
      WHERE id_profesional = $1
      RETURNING *
    `;
    const res = await query(sql, params);
    if (res.rowCount === 0) {
      const err = new Error('Profesional no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return res.rows[0];
  }

  // --- DISPONIBILIDAD ---

  async getDisponibilidad(idProfesional) {
    const sql = `
      SELECT id_disponibilidad, id_profesional, dia_semana, hora_inicio, hora_fin,
             fecha_inicio_vigencia, fecha_fin_vigencia, activo
      FROM disponibilidad
      WHERE id_profesional = $1 AND activo = TRUE
      ORDER BY dia_semana ASC, hora_inicio ASC
    `;
    const res = await query(sql, [idProfesional]);
    return res.rows;
  }

  async addDisponibilidad(idProfesional, { dia_semana, hora_inicio, hora_fin, fecha_inicio_vigencia, fecha_fin_vigencia }) {
    if (hora_inicio >= hora_fin) {
      const err = new Error('La hora de inicio debe ser anterior a la hora de fin.');
      err.statusCode = 400;
      throw err;
    }

    // Verificar si hay traslape con otra franja del mismo profesional ese día
    const overlapSql = `
      SELECT id_disponibilidad FROM disponibilidad
      WHERE id_profesional = $1 AND dia_semana = $2 AND activo = TRUE
        AND hora_inicio < $4 AND hora_fin > $3
    `;
    const overlapRes = await query(overlapSql, [idProfesional, dia_semana, hora_inicio, hora_fin]);
    if (overlapRes.rowCount > 0) {
      const err = new Error('La franja horaria se superpone con una disponibilidad ya registrada.');
      err.statusCode = 400;
      throw err;
    }

    const insertSql = `
      INSERT INTO disponibilidad (id_profesional, dia_semana, hora_inicio, hora_fin, fecha_inicio_vigencia, fecha_fin_vigencia, activo)
      VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6, TRUE)
      RETURNING *
    `;
    const res = await query(insertSql, [idProfesional, dia_semana, hora_inicio, hora_fin, fecha_inicio_vigencia, fecha_fin_vigencia || null]);
    return res.rows[0];
  }

  async deleteDisponibilidad(idProfesional, idDisponibilidad) {
    const sql = `
      UPDATE disponibilidad
      SET activo = FALSE
      WHERE id_profesional = $1 AND id_disponibilidad = $2
      RETURNING *
    `;
    const res = await query(sql, [idProfesional, idDisponibilidad]);
    if (res.rowCount === 0) {
      const err = new Error('Disponibilidad no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return res.rows[0];
  }

  /**
   * Obtiene los horarios o slots disponibles para una fecha específica (formato YYYY-MM-DD)
   * calculando las citas ya ocupadas y los horarios configurados para ese día de la semana.
   */
  async getHorariosDisponiblesPorFecha(idProfesional, fechaStr) {
    // Calcular día de la semana en PostgreSQL (1=Lunes .. 7=Domingo)
    const dayOfWeekSql = `SELECT EXTRACT(ISODOW FROM $1::date) AS dow`;
    const dowRes = await query(dayOfWeekSql, [fechaStr]);
    const dow = parseInt(dowRes.rows[0].dow, 10);

    // Obtener rangos disponibles para ese día
    const dispSql = `
      SELECT hora_inicio, hora_fin
      FROM disponibilidad
      WHERE id_profesional = $1 AND dia_semana = $2 AND activo = TRUE
        AND (fecha_fin_vigencia IS NULL OR fecha_fin_vigencia >= $3::date)
        AND fecha_inicio_vigencia <= $3::date
    `;
    const dispRes = await query(dispSql, [idProfesional, dow, fechaStr]);

    if (dispRes.rowCount === 0) {
      return [];
    }

    // Obtener citas ya programadas para ese profesional en esa fecha
    const citasSql = `
      SELECT fecha_hora_inicio, fecha_hora_fin
      FROM cita
      WHERE id_profesional = $1
        AND DATE(fecha_hora_inicio AT TIME ZONE 'UTC') = $2::date
        AND estado NOT IN ('CANCELADA', 'REPROGRAMADA')
    `;
    const citasRes = await query(citasSql, [idProfesional, fechaStr]);

    // Generar slots de 1 hora
    const slotsDisponibles = [];
    for (const disp of dispRes.rows) {
      let [startH, startM] = disp.hora_inicio.split(':').map(Number);
      let [endH, endM] = disp.hora_fin.split(':').map(Number);

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + 60 <= endMinutes) {
        const slotStartH = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
        const slotStartM = String(currentMinutes % 60).padStart(2, '0');
        const slotEndH = String(Math.floor((currentMinutes + 60) / 60)).padStart(2, '0');
        const slotEndM = String((currentMinutes + 60) % 60).padStart(2, '0');

        const slotInicioIso = `${fechaStr}T${slotStartH}:${slotStartM}:00.000Z`;
        const slotFinIso = `${fechaStr}T${slotEndH}:${slotEndM}:00.000Z`;

        const slotStartTime = new Date(slotInicioIso).getTime();
        const slotEndTime = new Date(slotFinIso).getTime();

        // Verificar si choca con alguna cita existente
        const conflicto = citasRes.rows.some((c) => {
          const cStart = new Date(c.fecha_hora_inicio).getTime();
          const cEnd = new Date(c.fecha_hora_fin).getTime();
          return slotStartTime < cEnd && slotEndTime > cStart;
        });

        if (!conflicto) {
          slotsDisponibles.push({
            fecha: fechaStr,
            hora_inicio: `${slotStartH}:${slotStartM}`,
            hora_fin: `${slotEndH}:${slotEndM}`,
            inicio_iso: slotInicioIso,
            fin_iso: slotFinIso,
          });
        }

        currentMinutes += 60; // slots de 1 hora
      }
    }

    return slotsDisponibles;
  }
}

module.exports = new ProfesionalesService();
