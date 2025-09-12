// PostgreSQL подключение и промисификация
const { Pool } = require('pg');

// Конфигурация подключения к PostgreSQL
const pgConfig = {
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'ytorsweb',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
  // Настройки пула соединений
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000, // закрывать клиенты после 30 секунд бездействия
  connectionTimeoutMillis: 2000, // возвращать ошибку после 2 секунд, если подключение не может быть установлено
};

// Создаем пул соединений
const pool = new Pool(pgConfig);

// Обработчик ошибок пула
pool.on('error', (err, client) => {
  console.error('Неожиданная ошибка на неактивном клиенте PostgreSQL', err);
  process.exit(-1);
});

/**
 * Выполнить SQL запрос с параметрами
 * @param {string} sql - SQL запрос
 * @param {Array} params - Параметры запроса
 * @returns {Promise<Object>} - Результат с lastID и changes
 */
async function run(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return {
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount || 0
    };
  } finally {
    client.release();
  }
}

/**
 * Получить одну запись
 * @param {string} sql - SQL запрос
 * @param {Array} params - Параметры запроса
 * @returns {Promise<Object|null>} - Одна запись или null
 */
async function get(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Получить все записи
 * @param {string} sql - SQL запрос
 * @param {Array} params - Параметры запроса
 * @returns {Promise<Array>} - Массив записей
 */
async function all(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Выполнить транзакцию
 * @param {Function} callback - Функция с операциями в транзакции
 * @returns {Promise<any>} - Результат выполнения
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Получить клиент из пула для сложных операций
 * @returns {Promise<Object>} - PostgreSQL клиент
 */
async function getClient() {
  return await pool.connect();
}

/**
 * Закрыть все соединения
 * @returns {Promise<void>}
 */
async function close() {
  await pool.end();
}

// Экспортируем функции и пул
module.exports = {
  pool,
  run,
  get,
  all,
  transaction,
  getClient,
  close
};
