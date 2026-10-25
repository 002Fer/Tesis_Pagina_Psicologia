const { query } = require('../config/database');

class ReportesService {
  /**
   * Reporte y estadísticas de citas
   */
  async getReporteCitas() {
    const estadoSql = `
      SELECT estado, COUNT(*)::int AS total
      FROM cita
      GROUP BY estado
    `;
    const tipoSql = `
      SELECT tipo, COUNT(*)::int AS total
      FROM cita
      GROUP BY tipo
    `;
    const mensualSql = `
      SELECT TO_CHAR(fecha_hora_inicio, 'YYYY-MM') AS mes,
             COUNT(*)::int AS total,
             COUNT(CASE WHEN estado = 'REALIZADA' THEN 1 END)::int AS realizadas,
             COUNT(CASE WHEN estado = 'CANCELADA' THEN 1 END)::int AS canceladas
      FROM cita
      GROUP BY TO_CHAR(fecha_hora_inicio, 'YYYY-MM')
      ORDER BY mes DESC
      LIMIT 6
    `;

    const [porEstado, porTipo, historicoMensual] = await Promise.all([
      query(estadoSql),
      query(tipoSql),
      query(mensualSql),
    ]);

    return {
      por_estado: porEstado.rows,
      por_tipo: porTipo.rows,
      historico_mensual: historicoMensual.rows,
    };
  }

  /**
   * Reporte de pacientes por estado y vinculaciones
   */
  async getReportePacientes() {
    const estadoSql = `
      SELECT estado, COUNT(*)::int AS total
      FROM paciente
      GROUP BY estado
    `;
    const solicitudesSql = `
      SELECT estado, COUNT(*)::int AS total
      FROM solicitud_atencion
      GROUP BY estado
    `;

    const [porEstado, porSolicitud] = await Promise.all([
      query(estadoSql),
      query(solicitudesSql),
    ]);

    return {
      pacientes_por_estado: porEstado.rows,
      solicitudes_por_estado: porSolicitud.rows,
    };
  }

  /**
   * Reporte de carga de atención por profesional (pacientes vinculados y citas)
   */
  async getReporteProfesionales() {
    const sql = `
      SELECT p.id_profesional, p.nombres, p.apellidos, p.estado,
             COUNT(DISTINCT v.id_paciente)::int AS pacientes_activos,
             COUNT(DISTINCT c.id_cita)::int AS total_citas,
             COUNT(DISTINCT CASE WHEN c.estado = 'REALIZADA' THEN c.id_cita END)::int AS citas_realizadas,
             COUNT(DISTINCT CASE WHEN c.estado = 'CANCELADA' THEN c.id_cita END)::int AS citas_canceladas
      FROM profesional p
      LEFT JOIN vinculacion v ON v.id_profesional = p.id_profesional AND v.estado = 'ACTIVA'
      LEFT JOIN cita c ON c.id_profesional = p.id_profesional
      GROUP BY p.id_profesional, p.nombres, p.apellidos, p.estado
      ORDER BY pacientes_activos DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  /**
   * Reporte de ocupación y uso de espacios
   */
  async getReporteEspacios() {
    const sql = `
      SELECT e.id_espacio, e.nombre, e.ubicacion, e.estado,
             COUNT(c.id_cita)::int AS total_citas_asignadas,
             COUNT(CASE WHEN c.estado = 'REALIZADA' THEN 1 END)::int AS citas_completadas
      FROM espacio e
      LEFT JOIN cita c ON c.id_espacio = e.id_espacio
      GROUP BY e.id_espacio, e.nombre, e.ubicacion, e.estado
      ORDER BY total_citas_asignadas DESC
    `;
    const res = await query(sql);
    return res.rows;
  }

  /**
   * Reporte de asistencias e inasistencias
   */
  async getReporteAsistencias() {
    const resumenSql = `
      SELECT 
        COUNT(CASE WHEN a.estado = 'ASISTIO' THEN 1 END)::int AS total_asistencias,
        COUNT(CASE WHEN a.estado = 'NO_ASISTIO' THEN 1 END)::int AS total_inasistencias,
        COUNT(CASE WHEN a.tipo_inasistencia = 'JUSTIFICADA' THEN 1 END)::int AS inasistencias_justificadas,
        COUNT(CASE WHEN a.tipo_inasistencia = 'INJUSTIFICADA' THEN 1 END)::int AS inasistencias_injustificadas
      FROM asistencia a
    `;
    const res = await query(resumenSql);
    return res.rows[0];
  }

  /**
   * Dashboard resumido para vista rápida (Secciones 61 y 62)
   */
  async getDashboardSummary(user) {
    if (user.rol === 'ADMINISTRADOR') {
      const statsSql = `
        SELECT
          (SELECT COUNT(*)::int FROM paciente WHERE estado = 'ACTIVO') AS pacientes_activos,
          (SELECT COUNT(*)::int FROM paciente WHERE estado = 'EN_ESPERA') AS pacientes_en_espera,
          (SELECT COUNT(*)::int FROM profesional WHERE estado = 'ACTIVO') AS profesionales_activos,
          (SELECT COUNT(*)::int FROM cita WHERE estado = 'PROGRAMADA') AS citas_programadas,
          (SELECT COUNT(*)::int FROM cita WHERE estado = 'REALIZADA') AS citas_realizadas,
          (SELECT COUNT(*)::int FROM cita WHERE estado = 'CANCELADA') AS citas_canceladas,
          (SELECT COUNT(*)::int FROM espacio WHERE estado = 'DISPONIBLE') AS espacios_disponibles
      `;
      const res = await query(statsSql);
      return res.rows[0];
    } else if (user.rol === 'PROFESIONAL') {
      const statsSql = `
        SELECT
          (SELECT COUNT(*)::int FROM vinculacion WHERE id_profesional = $1 AND estado = 'ACTIVA') AS mis_pacientes_activos,
          (SELECT COUNT(*)::int FROM cita WHERE id_profesional = $1 AND estado = 'PROGRAMADA') AS mis_citas_programadas,
          (SELECT COUNT(*)::int FROM cita WHERE id_profesional = $1 AND estado = 'REALIZADA') AS mis_citas_realizadas,
          (SELECT COUNT(*)::int FROM cita WHERE id_profesional = $1 AND estado = 'CANCELADA') AS mis_citas_canceladas,
          (SELECT COUNT(*)::int FROM cita WHERE id_profesional = $1 AND DATE(fecha_hora_inicio AT TIME ZONE 'UTC') = CURRENT_DATE) AS mis_citas_hoy
      `;
      const res = await query(statsSql, [user.id_profesional]);
      return res.rows[0];
    }
    return {};
  }
}

module.exports = new ReportesService();
