const { query, pool } = require('../config/database');
const citasService = require('./citas.service');

class SeguimientoService {
  /**
   * Crea o activa una vinculación paciente-profesional
   */
  async vincularPaciente({ id_paciente, id_profesional, origen = 'ASIGNACION_ADMINISTRATIVA' }, user) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Desactivar vinculaciones previas activas si las hubiera
      await client.query(
        `UPDATE vinculacion
         SET estado = 'FINALIZADA', fecha_fin = CURRENT_DATE
         WHERE id_paciente = $1 AND estado = 'ACTIVA'`,
        [id_paciente]
      );

      const insertSql = `
        INSERT INTO vinculacion (id_paciente, id_profesional, origen, creado_por, estado)
        VALUES ($1, $2, $3, $4, 'ACTIVA')
        RETURNING *
      `;
      const res = await client.query(insertSql, [id_paciente, id_profesional, origen, user.id_usuario]);
      const vinculacion = res.rows[0];

      // Actualizar estado del paciente a ACTIVO
      await client.query(`UPDATE paciente SET estado = 'ACTIVO' WHERE id_paciente = $1`, [id_paciente]);

      // Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'PROFESIONAL_ASIGNADO', 'Paciente vinculado exitosamente al profesional', $3)`,
        [id_paciente, user.id_usuario, JSON.stringify({ id_profesional, origen })]
      );

      await client.query('COMMIT');
      return vinculacion;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Crear un nuevo Plan de Seguimiento con su frecuencia y horarios
   */
  async createPlan({ id_vinculacion, frecuencia, horarios = [] }, user) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validar vinculación
      const vincRes = await client.query('SELECT * FROM vinculacion WHERE id_vinculacion = $1 AND estado = \'ACTIVA\'', [id_vinculacion]);
      if (vincRes.rowCount === 0) {
        const err = new Error('Vinculación no encontrada o no se encuentra activa.');
        err.statusCode = 404;
        throw err;
      }
      const vinc = vincRes.rows[0];

      // Desactivar planes previos de esta vinculación
      await client.query(
        `UPDATE plan_seguimiento
         SET estado = 'FINALIZADO', fecha_fin = CURRENT_DATE, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_vinculacion = $1 AND estado = 'ACTIVO'`,
        [id_vinculacion]
      );

      // Crear nuevo plan
      const insertPlanSql = `
        INSERT INTO plan_seguimiento (id_vinculacion, frecuencia, estado)
        VALUES ($1, $2, 'ACTIVO')
        RETURNING *
      `;
      const planRes = await client.query(insertPlanSql, [id_vinculacion, frecuencia]);
      const plan = planRes.rows[0];

      // Insertar horarios de seguimiento
      const horariosInsertados = [];
      for (const h of horarios) {
        const hRes = await client.query(
          `INSERT INTO horario_seguimiento (id_plan_seguimiento, dia_semana, hora_inicio, duracion_minutos, activo)
           VALUES ($1, $2, $3, $4, TRUE)
           RETURNING *`,
          [plan.id_plan_seguimiento, h.dia_semana, h.hora_inicio, h.duracion_minutos || 60]
        );
        horariosInsertados.push(hRes.rows[0]);
      }

      // Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'FRECUENCIA_MODIFICADA', 'Plan de seguimiento establecido', $3)`,
        [
          vinc.id_paciente,
          user.id_usuario,
          JSON.stringify({
            id_plan: plan.id_plan_seguimiento,
            frecuencia,
            cantidad_horarios: horarios.length,
          }),
        ]
      );

      await client.query('COMMIT');
      return {
        ...plan,
        horarios: horariosInsertados,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getPlanById(idPlan) {
    const planSql = `
      SELECT p.*, v.id_paciente, v.id_profesional,
             pac.nombres AS pac_nombres, pac.apellidos AS pac_apellidos,
             prof.nombres AS prof_nombres, prof.apellidos AS prof_apellidos
      FROM plan_seguimiento p
      JOIN vinculacion v ON p.id_vinculacion = v.id_vinculacion
      JOIN paciente pac ON v.id_paciente = pac.id_paciente
      JOIN profesional prof ON v.id_profesional = prof.id_profesional
      WHERE p.id_plan_seguimiento = $1
    `;
    const planRes = await query(planSql, [idPlan]);
    if (planRes.rowCount === 0) {
      const err = new Error('Plan de seguimiento no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const plan = planRes.rows[0];
    const horRes = await query(
      'SELECT * FROM horario_seguimiento WHERE id_plan_seguimiento = $1 AND activo = TRUE ORDER BY dia_semana ASC',
      [idPlan]
    );
    plan.horarios = horRes.rows;
    return plan;
  }

  async updateFrecuencia(idPlan, { nueva_frecuencia, horarios = [] }, user) {
    const planActual = await this.getPlanById(idPlan);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateSql = `
        UPDATE plan_seguimiento
        SET frecuencia = $1, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_plan_seguimiento = $2
        RETURNING *
      `;
      const res = await client.query(updateSql, [nueva_frecuencia, idPlan]);

      if (horarios && horarios.length > 0) {
        await client.query('DELETE FROM horario_seguimiento WHERE id_plan_seguimiento = $1', [idPlan]);
        for (const h of horarios) {
          await client.query(
            `INSERT INTO horario_seguimiento (id_plan_seguimiento, dia_semana, hora_inicio, duracion_minutos, activo)
             VALUES ($1, $2, $3, $4, TRUE)`,
            [idPlan, h.dia_semana, h.hora_inicio, h.duracion_minutos || 60]
          );
        }
      }

      // Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion, datos_adicionales)
         VALUES ($1, $2, 'FRECUENCIA_MODIFICADA', 'Modificación de frecuencia de atención', $3)`,
        [
          planActual.id_paciente,
          user.id_usuario,
          JSON.stringify({
            frecuencia_anterior: planActual.frecuencia,
            frecuencia_nueva: nueva_frecuencia,
          }),
        ]
      );

      await client.query('COMMIT');
      return this.getPlanById(idPlan);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async finalizarSeguimiento(idPlan, user) {
    const plan = await this.getPlanById(idPlan);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Finalizar plan
      await client.query(
        `UPDATE plan_seguimiento
         SET estado = 'FINALIZADO', fecha_fin = CURRENT_DATE, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_plan_seguimiento = $1`,
        [idPlan]
      );

      // 2. Finalizar vinculación
      await client.query(
        `UPDATE vinculacion
         SET estado = 'FINALIZADA', fecha_fin = CURRENT_DATE
         WHERE id_vinculacion = $1`,
        [plan.id_vinculacion]
      );

      // 3. Pasar paciente a FINALIZADO
      await client.query(
        `UPDATE paciente
         SET estado = 'FINALIZADO', fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_paciente = $1`,
        [plan.id_paciente]
      );

      // 4. Historial
      await client.query(
        `INSERT INTO historial_administrativo (id_paciente, id_usuario, tipo_evento, descripcion)
         VALUES ($1, $2, 'SEGUIMIENTO_FINALIZADO', 'Proceso de seguimiento y atención psicológica finalizado exitosamente')`,
        [plan.id_paciente, user.id_usuario]
      );

      await client.query('COMMIT');
      return { mensaje: 'Seguimiento finalizado exitosamente', id_plan: idPlan };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Generación automática de citas recurrentes para un plan de seguimiento
   * @param {number} semanasACrear Cantidad de semanas hacia adelante a proyectar
   */
  async generarCitasRecurrentes(idPlan, semanasACrear = 4, user) {
    const plan = await this.getPlanById(idPlan);
    if (plan.estado !== 'ACTIVO') {
      const err = new Error('No se pueden programar citas para un plan inactivo.');
      err.statusCode = 400;
      throw err;
    }

    if (!plan.horarios || plan.horarios.length === 0) {
      const err = new Error('El plan de seguimiento no tiene horarios configurados.');
      err.statusCode = 400;
      throw err;
    }

    const citasGeneradas = [];
    const fechaBase = new Date();

    // Recorrer los próximos días
    for (let d = 1; d <= semanasACrear * 7; d++) {
      const fechaIterada = new Date(fechaBase);
      fechaIterada.setDate(fechaBase.getDate() + d);

      // Día de la semana (1 = Lunes .. 7 = Domingo)
      const jsDay = fechaIterada.getDay();
      const isoDow = jsDay === 0 ? 7 : jsDay;

      // Buscar si este día coincide con algún horario del plan
      const horarioMatch = plan.horarios.find((h) => h.dia_semana === isoDow);
      if (horarioMatch) {
        const [h, m] = horarioMatch.hora_inicio.split(':').map(Number);
        const duracion = horarioMatch.duracion_minutos || 60;

        const inicio = new Date(fechaIterada);
        inicio.setHours(h, m, 0, 0);

        const fin = new Date(inicio);
        fin.setMinutes(inicio.getMinutes() + duracion);

        try {
          const nuevaCita = await citasService.create(
            {
              id_paciente: plan.id_paciente,
              id_profesional: plan.id_profesional,
              id_plan_seguimiento: plan.id_plan_seguimiento,
              fecha_hora_inicio: inicio.toISOString(),
              fecha_hora_fin: fin.toISOString(),
              tipo: 'SEGUIMIENTO',
            },
            user
          );
          citasGeneradas.push(nuevaCita);
        } catch (conflictoErr) {
          // Si hay conflicto en una fecha en particular, se omite y continúa con las demás
          console.warn(`[SEGUIMIENTO] No se pudo agendar cita el ${inicio.toISOString()}: ${conflictoErr.message}`);
        }
      }
    }

    return citasGeneradas;
  }
}

module.exports = new SeguimientoService();
