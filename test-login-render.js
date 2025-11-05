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

  let pool;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: {
        mode: 'REQUIRED',
        rejectUnauthorized: false
      },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    console.log('🔄 Connecting to DB...');
    const conn = await pool.getConnection();
    console.log('✅ DB Connected! Connection ID:', conn.threadId);

    console.log('🔄 Fetching first 5 users from `usuarios`...');
    const [users] = await pool.query('SELECT id, nombre, apellidos, email, password FROM usuarios LIMIT 5');

    if (users.length === 0) {
      console.warn('⚠️ No users found in `usuarios` table.');
    } else {
      console.log('✅ Users fetched:', users);

      // Пример логина первого пользователя
      const testUser = users[0];
      console.log(`🔐 Testing login for user: ${testUser.email}`);

      const inputPassword = 'your_test_password_here'; // временный пароль для теста
      const isMatch = await bcrypt.compare(inputPassword, testUser.password);
      console.log(`Password match: ${isMatch}`);
    }

    conn.release();
  } catch (err) {
    console.error('❌ DB Error:', err.stack || err);
  } finally {
    if (pool) {
      await pool.end();
      console.log('✅ DB Connection closed');
    }
    console.log('=== Script finished ===');
  }
})();
