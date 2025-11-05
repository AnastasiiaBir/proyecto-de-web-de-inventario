// checkAllTables.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: {
        mode: 'REQUIRED',
        rejectUnauthorized: false // для теста
      }
    });

    console.log('✅ Connected to DB:', process.env.DB_NAME);

    // Получаем все таблицы в базе
    const [rows] = await connection.query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME;
    `, [process.env.DB_NAME]);

    console.log('=== ALL TABLES IN DATABASE ===');
    rows.forEach(row => {
      console.log(`Schema: ${row.TABLE_SCHEMA}, Table: ${row.TABLE_NAME}`);
    });
    console.log('==============================');

    await connection.end();
  } catch (err) {
    console.error('❌ DB Error:', err);
  }
}

checkTables();
