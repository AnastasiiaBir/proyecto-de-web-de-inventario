// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Логируем переменные подключения
console.log('=== DB CONNECTION INFO ===');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('SSL:', process.env.DB_SSL);
console.log('==========================');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    mode: process.env.DB_SSL ? process.env.DB_SSL.replace('ssl-mode=', '') : 'REQUIRED',
    rejectUnauthorized: false
  }
});

// Логируем успешное подключение
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
  } else {
    console.log('✅ DB Connected Successfully!');
    console.log('Connected as ID:', connection.threadId);
    connection.release();
  }
});

module.exports = pool.promise();