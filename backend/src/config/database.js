const mongoose = require('mongoose');
const { Pool } = require('pg');

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Lazy-init PostgreSQL pool so the app still runs when PG is not configured.
let pgPool;

const getPgPool = () => {
  if (pgPool) return pgPool;

  pgPool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'healthcare_portal',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pgPool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

  return pgPool;
};

const initPostgres = async () => {
  try {
    const pool = getPgPool();
    await pool.query('SELECT NOW()'); // connectivity check
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_snapshots (
        id SERIAL PRIMARY KEY,
        patients INTEGER DEFAULT 0,
        doctors INTEGER DEFAULT 0,
        admins INTEGER DEFAULT 0,
        appointments INTEGER DEFAULT 0,
        prescriptions INTEGER DEFAULT 0,
        captured_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ PostgreSQL connected and analytics_snapshots ready');
    return pool;
  } catch (error) {
    console.warn('⚠️ PostgreSQL not ready, skipping SQL analytics:', error.message);
    return null;
  }
};

module.exports = { connectMongoDB, getPgPool, initPostgres };


