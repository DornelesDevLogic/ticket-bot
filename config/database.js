import { Pool } from 'pg';

// ─── ENVIRONMENT VALIDATION ────────────────────────────────────────────────────
const requiredEnvVars = ['DB_USER', 'DB_NAME', 'DB_PASS'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// ─── POOL CONFIGURATION ─────────────────────────────────────────────────────────
const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port:     Number(process.env.DB_PORT) || 5432,
});

// ─── CONNECTION TEST ─────────────────────────────────────────────────────────────
(async function testConnection() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT NOW()');
    console.log(`✅ Database connected at: ${rows[0].now}`);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('Current configuration:', {
      user:     pool.options.user,
      host:     pool.options.host,
      database: pool.options.database,
      port:     pool.options.port,
    });
    process.exit(1);
  }
}());

// ─── UNEXPECTED ERROR HANDLER ────────────────────────────────────────────────────
pool.on('error', (err) => {
  console.error('⚠️  Unexpected database error:', err);
});

// ─── QUERY HELPER ───────────────────────────────────────────────────────────────
const query = (text, params) => pool.query(text, params);

// ─── EXPORTS ─────────────────────────────────────────────────────────────────────
export {
  pool,
  query
};
