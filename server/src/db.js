require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Driver serverless de Neon: conecta por WebSocket sobre HTTPS (puerto 443)
// en vez del protocolo Postgres crudo (puerto 5432). Es API-compatible con
// `pg`, y además atraviesa redes que bloquean o cortan el 5432 (VPNs,
// firewalls corporativos, redes móviles).
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn('[DB] Warning: DATABASE_URL is missing from environment variables.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = { pool };
