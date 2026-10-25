require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Comprobar conexión a la base de datos PostgreSQL
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS connected_time, current_database() AS db');
    client.release();

    console.log(`[DB] Conexión exitosa a PostgreSQL (${res.rows[0].db}) a las ${res.rows[0].connected_time}`);

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` Servidor Backend Psicología corriendo en puerto ${PORT}`);
      console.log(` URL Base: http://localhost:${PORT}/api`);
      console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[SERVER] Error crítico al conectar con PostgreSQL:', err.message);
    console.error('[SERVER] Verifica que el contenedor Docker o el servicio de PostgreSQL esté iniciado y el archivo .env configurado.');
    // Iniciar el servidor de todas maneras para permitir diagnóstico y healthchecks
    app.listen(PORT, () => {
      console.log(`[SERVER] Servidor levantado en puerto ${PORT} en modo degradado (sin BD activa).`);
    });
  }
}

startServer();
