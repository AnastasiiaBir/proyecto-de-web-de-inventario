require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  console.log('=== Testing Users on Render ===');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('==============================');

  try {
    console.log('🔄 Connecting to DB...');
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: { mode: 'REQUIRED', rejectUnauthorized: false }
    });

    const connection = await pool.getConnection();
    console.log('✅ DB Connected! Connection ID:', connection.threadId);

    console.log('🔄 Fetching first 5 users from `usuarios`...');
    const [rows] = await pool.query('SELECT id, nombre, apellidos, email, password FROM usuarios LIMIT 5');
    console.log('✅ Users fetched:', rows);

    if (rows.length > 0) {
      const user = rows[0];
      console.log(`\n🔐 Testing login for user: ${user.email}`);

      // Здесь укажи пароль для теста
      const testPassword = 'admin123';

      const passwordMatch = await bcrypt.compare(testPassword, user.password);
      console.log('Password match:', passwordMatch);
    }

    await connection.release();
    await pool.end();
    console.log('✅ DB Connection closed');
  } catch (err) {
    console.error('❌ DB Error:', err.stack || err);
  }
})();