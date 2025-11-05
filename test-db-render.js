// test-db-render.js
const mysql = require('mysql2/promise');

(async () => {
  try {
    console.log('=== Testing DB Connection on Render ===');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('==============================');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: {
        mode: 'REQUIRED',
        rejectUnauthorized: false // игнор self-signed сертификатов Aiven/Render
      },
      connectTimeout: 15000
    });

    console.log('✅ Connected to DB as ID:', connection.threadId);

    const [rows] = await connection.query('SELECT CURRENT_USER(), USER(), DATABASE();');
    console.log('DB Info:', rows);

    await connection.end();
    console.log('✅ Connection closed');
  } catch (err) {
    console.error('❌ DB Connection Failed:', err);
  }
})();
