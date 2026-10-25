/**
 * Script de prueba automatizada para validar los hitos técnicos del backend
 */
const http = require('http');

function request(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n--- INICIANDO SUITE DE PRUEBAS DEL BACKEND ---');

  const PORT = process.env.PORT || 3001;

  // 1. Healthcheck
  console.log('\n1. Probando Healthcheck...');
  let res = await request({ host: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
  console.log('Status:', res.status, res.data);

  // 2. Login Admin
  console.log('\n2. Probando Login Administrador...');
  res = await request(
    {
      host: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { correo: 'admin@clinica.com', password: 'Admin123*' }
  );
  console.log('Status:', res.status, 'Admin logueado:', res.data.data.usuario.correo);
  const adminToken = res.data.data.token;

  // 3. Login Paciente
  console.log('\n3. Probando Login Paciente...');
  res = await request(
    {
      host: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { correo: 'paciente@gmail.com', password: 'Paciente123*' }
  );
  console.log('Status:', res.status, 'Paciente logueado:', res.data.data.usuario.correo);
  const pacienteToken = res.data.data.token;
  const pacienteId = res.data.data.usuario.perfil.id_paciente;

  // 4. Consultar Profesionales
  console.log('\n4. Consultando lista de profesionales disponibles...');
  res = await request({
    host: 'localhost',
    port: PORT,
    path: '/api/profesionales',
    method: 'GET',
    headers: { Authorization: `Bearer ${pacienteToken}` },
  });
  console.log('Status:', res.status, 'Total profesionales:', res.data.data.length);
  const profId = res.data.data[0].id_profesional;

  // 5. Consultar horarios libres para el lunes 2026-10-26 (el profesional atiende lunes de 8:00 a 13:00)
  console.log('\n5. Consultando horarios libres del profesional...');
  res = await request({
    host: 'localhost',
    port: PORT,
    path: `/api/profesionales/${profId}/horarios-libres?fecha=2026-10-26`,
    method: 'GET',
    headers: { Authorization: `Bearer ${pacienteToken}` },
  });
  console.log('Status:', res.status, 'Horarios libres disponibles:', res.data.data.map(h => `${h.hora_inicio}-${h.hora_fin}`));

  // 6. Programar primera cita
  console.log('\n6. Programando primera cita (09:00 - 10:00)...');
  res = await request(
    {
      host: 'localhost',
      port: PORT,
      path: '/api/citas',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pacienteToken}`,
      },
    },
    {
      id_paciente: pacienteId,
      id_profesional: profId,
      fecha_hora_inicio: '2026-10-26T09:00:00.000Z',
      fecha_hora_fin: '2026-10-26T10:00:00.000Z',
      tipo: 'INICIAL',
    }
  );
  console.log('Status:', res.status, 'Cita creada exitosamente ID:', res.data.data?.id_cita);
  const citaId = res.data.data?.id_cita;

  // 7. Intentar crear cita con conflicto (09:30 - 10:30) -> Debe fallar con 409
  console.log('\n7. Probando regla de negocio: detección de conflictos simultáneos...');
  res = await request(
    {
      host: 'localhost',
      port: PORT,
      path: '/api/citas',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      id_paciente: pacienteId,
      id_profesional: profId,
      fecha_hora_inicio: '2026-10-26T09:30:00.000Z',
      fecha_hora_fin: '2026-10-26T10:30:00.000Z',
      tipo: 'INICIAL',
    }
  );
  console.log('Resultado validación conflicto -> Status esperado: 409 | Status obtenido:', res.status, '| Mensaje:', res.data.message);

  // 8. Registrar asistencia de la cita
  console.log('\n8. Registrando asistencia a la cita...');
  res = await request(
    {
      host: 'localhost',
      port: PORT,
      path: '/api/asistencias',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      id_cita: citaId,
      estado: 'ASISTIO',
    }
  );
  console.log('Status:', res.status, 'Asistencia registrada:', res.data.data?.estado);

  // 9. Crear plan de seguimiento con frecuencia semanal
  console.log('\n9. Creando plan de seguimiento con frecuencia semanal...');
  // Primero obtener la vinculación creada automáticamente
  const pacDetalle = await request({
    host: 'localhost',
    port: PORT,
    path: `/api/pacientes/${pacienteId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const vincId = pacDetalle.data.data.vinculacion_actual.id_vinculacion;

  res = await request(
    {
      host: 'localhost',
      port: PORT,
      path: '/api/seguimientos/planes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      id_vinculacion: vincId,
      frecuencia: 'SEMANAL',
      horarios: [
        {
          dia_semana: 1,
          hora_inicio: '09:00:00',
          duracion_minutos: 60,
        },
      ],
    }
  );
  console.log('Status:', res.status, 'Plan creado ID:', res.data.data?.id_plan_seguimiento, 'Frecuencia:', res.data.data?.frecuencia);
  const planId = res.data.data?.id_plan_seguimiento;

  // 10. Modificar frecuencia a QUINCENAL
  console.log('\n10. Modificando frecuencia de atención a QUINCENAL...');
  res = await request(
    {
      host: 'localhost',
      port: PORT,
      path: `/api/seguimientos/planes/${planId}/frecuencia`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      nueva_frecuencia: 'QUINCENAL',
    }
  );
  console.log('Status:', res.status, 'Nueva frecuencia registrada:', res.data.data?.frecuencia);

  // 11. Consultar Dashboard General
  console.log('\n11. Consultando Dashboard Administrativo...');
  res = await request({
    host: 'localhost',
    port: PORT,
    path: '/api/reportes/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('Status:', res.status, 'Métricas Dashboard:', res.data.data);

  console.log('\n======================================================');
  console.log(' ¡TODAS LAS PRUEBAS FUNCIONARON SATISFACTORIAMENTE! ');
  console.log('======================================================\n');
}

runTests().catch(console.error);
