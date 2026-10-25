const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function createDatabaseIfNotExists() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 5432;
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres123';
  const dbName = process.env.DB_NAME || 'psicologia_db';

  const client = new Client({ host, port, user, password, database: 'postgres' });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`[INIT] Creando base de datos '${dbName}'...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[INIT] Base de datos '${dbName}' creada con éxito.`);
    } else {
      console.log(`[INIT] La base de datos '${dbName}' ya existe.`);
    }
  } catch (err) {
    console.warn(`[INIT] Advertencia al verificar/crear base de datos:`, err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

async function runSchema() {
  await createDatabaseIfNotExists();

  const { pool } = require('../config/database');
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('[INIT] Ejecutando schema.sql...');
  const client = await pool.connect();
  try {
    await client.query(schemaSql);
    console.log('[INIT] ¡Esquema de base de datos creado exitosamente!');
  } catch (err) {
    console.error('[INIT] Error ejecutando schema.sql:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
