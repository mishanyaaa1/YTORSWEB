// PostgreSQL подключение и промисификация
const { Pool } = require('pg');

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

/**
 * Обертки промисов для работы с PostgreSQL
 */
async function run(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return { 
      lastID: result.rows[0]?.id || null, 
      changes: result.rowCount || 0,
      rows: result.rows 
    };
  } finally {
    client.release();
  }
}

async function get(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function all(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Функция для выполнения транзакций
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback({
      run: (sql, params) => client.query(sql, params).then(r => ({ lastID: r.rows[0]?.id, changes: r.rowCount, rows: r.rows })),
      get: (sql, params) => client.query(sql, params).then(r => r.rows[0] || null),
      all: (sql, params) => client.query(sql, params).then(r => r.rows)
    });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Функция для закрытия пула соединений
async function close() {
  await pool.end();
}

module.exports = {
  pool,
  run,
  get,
  all,
  transaction,
  close
};