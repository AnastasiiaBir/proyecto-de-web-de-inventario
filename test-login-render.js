require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  console.log('=== Testing Users on Render ===');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('==============================');

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: { mode: 'REQUIRED', rejectUnauthorized: false }
    });

    const [rows] = await pool.query('SELECT id, username, email FROM users LIMIT 5'); // первые 5 пользователей
    console.log('✅ Users fetched:', rows);

    // Пробуем логинить первого пользователя (только тест)
    if (rows.length > 0) {
      const user = rows[0];
      console.log(`Trying login test for user: ${user.username}`);
      // Здесь можно добавить проверку хеша пароля через bcrypt, если нужно
    }

    await pool.end();
    console.log('✅ Connection closed');
  } catch (err) {
    console.error('❌ DB Error:', err.stack || err);
  }
})();
