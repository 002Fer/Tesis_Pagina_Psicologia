const { query, pool } = require('../config/database');

class PacientesService {
  async getAll(user, filtros = {}) {
    let sql = `
      SELECT p.id_paciente, p.id_usuario, p.nombres, p.apellidos, p.fecha_nacimiento,
             p.telefono, p.estado, p.fecha_registro, u.correo,
             v.id_vinculacion, v.id_profesional, prof.nombres AS prof_nombres, prof.apellidos AS prof_apellidos
      FROM paciente p
      LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
      LEFT JOIN vinculacion v ON v.id_paciente = p.id_paciente AND v.estado = 'ACTIVA'
      LEFT JOIN profesional prof ON prof.id_profesional = v.id_profesional
      WHERE 1=1
    `;
    const params = [];

    // Si el usuario es PROFESIONAL, solo puede ver sus pacientes vinculados (Seguridad del Plan #44)
    if (user.rol === 'PROFESIONAL') {
      params.push(user.id_profesional);
      sql += ` AND v.id_profesional = $${params.length}`;
    }

    if (filtros.estado) {
      params.push(filtros.estado);
      sql += ` AND p.estado = $${params.length}`;
    }

    if (filtros.search) {
      params.push(`%${filtros.search.toLowerCase()}%`);
      sql += ` AND (LOWER(p.nombres) LIKE $${params.length} OR LOWER(p.apellidos) LIKE $${params.length} OR LOWER(u.correo) LIKE $${params.length})`;
    }

    sql += ' ORDER BY p.apellidos ASC, p.nombres ASC';
    const res = await query(sql, params);
    return res.rows;
  }

  async getById(id, user) {
    const sql = `
      SELECT p.id_paciente, p.id_usuario, p.nombres, p.apellidos, p.fecha_nacimiento,
             p.telefono, p.estado, p.fecha_registro, p.fecha_actualizacion, u.correo
      FROM paciente p
      LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE p.id_paciente = $1
    `;
    const res = await query(sql, [id]);
    if (res.rowCount === 0) {
      const err = new Error('Paciente no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const paciente = res.rows[0];

    // Validar acceso según el rol
    if (user.rol === 'PACIENTE' && user.id_paciente !== Number(id)) {
      const err = new Error('Acceso no autorizado a este expediente de paciente.');
      err.statusCode = 403;
      throw err;
    }

    if (user.rol === 'PROFESIONAL') {
      const vincSql = `
        SELECT 1 FROM vinculacion 
        WHERE id_paciente = $1 AND id_profesional = $2 AND estado = 'ACTIVA'
      `;
      const vincRes = await query(vincSql, [id, user.id_profesional]);
      if (vincRes.rowCount === 0) {
        const err = new Error('El paciente no se encuentra vinculado a este profesional.');
        err.statusCode = 403;
        throw err;
      }
    }

    // Traer responsables
    const respRes = await query('SELECT * FROM responsable WHERE id_paciente = $1', [id]);
    paciente.responsables = respRes.rows;

    // Traer vinculación activa
    const vincInfo = await query(`
      SELECT v.*, prof.nombres AS prof_nombres, prof.apellidos AS prof_apellidos
      FROM vinculacion v
      JOIN profesional prof ON v.id_profesional = prof.id_profesional
      WHERE v.id_paciente = $1 AND v.estado = 'ACTIVA'
    `, [id]);
    paciente.vinculacion_actual = vincInfo.rows[0] || null;

    return paciente;
  }

  async create({ nombres, apellidos, fecha_nacimiento, telefono, estado = 'SOLICITANTE' }, createdByUserId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertSql = `
        INSERT INTO paciente (nombres, apellidos, fecha_nacimiento, telefono, estado)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const res = await client.query(insertSql, [nombres, apellidos, fecha_nacimiento || null, telefono || null, estado]);
      const nuevoPaciente = res.rows[0];

      // Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion)
         VALUES ($1, $2, 'PACIENTE_REGISTRADO', 'Registro manual de paciente por administración')`,
        [nuevoPaciente.id_paciente, createdByUserId]
      );

      await client.query('COMMIT');
      return nuevoPaciente;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id, data, user) {
    // Validar permisos
    if (user.rol === 'PACIENTE' && user.id_paciente !== Number(id)) {
      const err = new Error('Acceso no autorizado.');
      err.statusCode = 403;
      throw err;
    }

    const { nombres, apellidos, fecha_nacimiento, telefono, estado } = data;
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
    if (fecha_nacimiento !== undefined) {
      params.push(fecha_nacimiento);
      fields.push(`fecha_nacimiento = $${params.length}`);
    }
    if (telefono !== undefined) {
      params.push(telefono);
      fields.push(`telefono = $${params.length}`);
    }
    if (estado !== undefined && (user.rol === 'ADMINISTRADOR' || user.rol === 'PROFESIONAL')) {
      params.push(estado);
      fields.push(`estado = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.getById(id, user);
    }

    fields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    const sql = `
      UPDATE paciente
      SET ${fields.join(', ')}
      WHERE id_paciente = $1
      RETURNING *
    `;
    const res = await query(sql, params);
    if (res.rowCount === 0) {
      const err = new Error('Paciente no encontrado');
      err.statusCode = 404;
      throw err;
    }

    // Registrar en historial si cambió de estado
    if (estado !== undefined) {
      await query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'ESTADO_PACIENTE_ACTUALIZADO', 'Cambio de estado administrativo del paciente', $3)`,
        [id, user.id_usuario, JSON.stringify({ nuevo_estado: estado })]
      );
    }

    return res.rows[0];
  }

  // --- RESPONSABLES ---
  async addResponsable(idPaciente, { nombres, apellidos, parentesco, telefono, correo }) {
    const sql = `
      INSERT INTO responsable (id_paciente, nombres, apellidos, parentesco, telefono, correo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const res = await query(sql, [idPaciente, nombres, apellidos, parentesco || null, telefono || null, correo || null]);
    return res.rows[0];
  }

  // --- SOLICITUDES DE ATENCIÓN ---
  async createSolicitud(idPaciente, motivo_consulta) {
    const sql = `
      INSERT INTO solicitud_atencion (id_paciente, motivo_consulta, estado)
      VALUES ($1, $2, 'PENDIENTE')
      RETURNING *
    `;
    const res = await query(sql, [idPaciente, motivo_consulta]);
    return res.rows[0];
  }

  async getSolicitudes(filtros = {}) {
    let sql = `
      SELECT s.*, p.nombres, p.apellidos, p.telefono, u.correo
      FROM solicitud_atencion s
      JOIN paciente p ON s.id_paciente = p.id_paciente
      LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE 1=1
    `;
    const params = [];
    if (filtros.estado) {
      params.push(filtros.estado);
      sql += ` AND s.estado = $${params.length}`;
    }
    sql += ' ORDER BY s.fecha_solicitud DESC';
    const res = await query(sql, params);
    return res.rows;
  }

  // --- HISTORIAL ADMINISTRATIVO ---
  async getHistorial(idPaciente, user) {
    // Validar permiso
    await this.getById(idPaciente, user);

    const sql = `
      SELECT h.*, u.correo AS usuario_correo, r.nombre AS usuario_rol
      FROM historial_administrativo h
      LEFT JOIN usuario u ON h.id_usuario = u.id_usuario
      LEFT JOIN rol r ON u.id_rol = r.id_rol
      WHERE h.id_paciente = $1
      ORDER BY h.fecha_evento DESC
    `;
    const res = await query(sql, [idPaciente]);
    return res.rows;
  }
}

module.exports = new PacientesService();
