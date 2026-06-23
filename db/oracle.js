const oracledb = require('oracledb');
const dotenv = require('dotenv');

dotenv.config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
  poolMin: 1,
  poolMax: 4,
  poolIncrement: 1
};

let pool;

async function init() {
  if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_CONNECTION_STRING) {
    throw new Error('Database credentials are required in .env');
  }

  pool = await oracledb.createPool(poolConfig);
}

async function close() {
  if (pool) {
    await pool.close(10);
  }
}

async function getConnection() {
  if (!pool) {
    await init();
  }
  return pool.getConnection();
}

async function query(sql, binds = {}) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(sql, binds, { autoCommit: false });
    return result.rows;
  } finally {
    await connection.close();
  }
}

async function execute(sql, binds = {}) {
  const connection = await getConnection();
  try {
    await connection.execute(sql, binds, { autoCommit: true });
  } finally {
    await connection.close();
  }
}

module.exports = {
  init,
  close,
  getConnection,
  query,
  execute
};
