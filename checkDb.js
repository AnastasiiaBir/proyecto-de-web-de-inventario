// checkDb.js
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const db = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    // Проверяем таблицу категорий
    const [categorias] = await db.query('SELECT * FROM categorias');
    console.log('=== Categorias ===');
    console.table(categorias);

    // Проверяем другую таблицу, если нужно
    const [localizaciones] = await db.query('SELECT * FROM localizaciones');
    console.log('=== Localizaciones ===');
    console.table(localizaciones);

    process.exit(0);
  } catch (err) {
    console.error('Ошибка подключения или запроса:', err);
  }
})();
