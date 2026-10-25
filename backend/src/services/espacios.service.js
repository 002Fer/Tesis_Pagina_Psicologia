const { query } = require('../config/database');

class EspaciosService {
  async getAll(filtros = {}) {
    let sql = 'SELECT * FROM espacio WHERE 1=1';
    const params = [];
    if (filtros.estado) {
      params.push(filtros.estado);
      sql += ` AND estado = $${params.length}`;
    }
    sql += ' ORDER BY nombre ASC';
    const res = await query(sql, params);
    return res.rows;
  }

  async getById(id) {
    const res = await query('SELECT * FROM espacio WHERE id_espacio = $1', [id]);
    if (res.rowCount === 0) {
      const err = new Error('Espacio no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return res.rows[0];
  }

  async create({ nombre, descripcion, ubicacion, estado = 'DISPONIBLE' }) {
    const sql = `
      INSERT INTO espacio (nombre, descripcion, ubicacion, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(sql, [nombre, descripcion || null, ubicacion || null, estado]);
    return res.rows[0];
  }

  async update(id, { nombre, descripcion, ubicacion, estado }) {
    const fields = [];
    const params = [id];

    if (nombre !== undefined) {
      params.push(nombre);
      fields.push(`nombre = $${params.length}`);
    }
    if (descripcion !== undefined) {
      params.push(descripcion);
      fields.push(`descripcion = $${params.length}`);
    }
    if (ubicacion !== undefined) {
      params.push(ubicacion);
      fields.push(`ubicacion = $${params.length}`);
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
      UPDATE espacio
      SET ${fields.join(', ')}
      WHERE id_espacio = $1
      RETURNING *
    `;
    const res = await query(sql, params);
    if (res.rowCount === 0) {
      const err = new Error('Espacio no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return res.rows[0];
  }

  /**
   * Retorna los espacios disponibles que NO tienen citas agendadas en el rango [inicio, fin]
   * Sección 22 y 41 del plan.
   */
  async getDisponibles(inicioIso, finIso) {
    const sql = `
      SELECT e.*
      FROM espacio e
      WHERE e.estado = 'DISPONIBLE'
        AND e.id_espacio NOT IN (
          SELECT DISTINCT c.id_espacio
          FROM cita c
          WHERE c.id_espacio IS NOT NULL
            AND c.estado NOT IN ('CANCELADA', 'REPROGRAMADA')
            AND c.fecha_hora_inicio < $2
            AND c.fecha_hora_fin > $1
        )
      ORDER BY e.nombre ASC
    `;
    const res = await query(sql, [inicioIso, finIso]);
    return res.rows;
  }
}

module.exports = new EspaciosService();
