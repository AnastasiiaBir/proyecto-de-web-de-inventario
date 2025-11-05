// test-all-tables-render.js
require('dotenv').config();
const mysql = require('mysql2/promise');

function ts() {
  return new Date().toISOString();
}

(async () => {
  console.log(`[${ts()}] === Testing All Tables on Render ===`);
  console.log(`[${ts()}] DB_HOST:`, process.env.DB_HOST);
  console.log(`[${ts()}] DB_PORT:`, process.env.DB_PORT);
  console.log(`[${ts()}] DB_USER:`, process.env.DB_USER);
  console.log(`[${ts()}] DB_NAME:`, process.env.DB_NAME);
  console.log('==============================');

  let pool;
  try {
    console.log(`[${ts()}] 🔄 Connecting to DB...`);
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: { mode: 'REQUIRED', rejectUnauthorized: false },
      connectionLimit: 10
    });

    const conn = await pool.getConnection();
    console.log(`[${ts()}] ✅ DB Connected! Connection ID: ${conn.threadId}`);
    conn.release();

    // Получаем список всех таблиц
    const [tables] = await pool.query('SHOW TABLES');
    const tableKey = `Tables_in_${process.env.DB_NAME}`;
    console.log(`[${ts()}] 🔄 Found ${tables.length} tables:`);

    for (const row of tables) {
      const tableName = row[tableKey];
      console.log(`\n[${ts()}] 📂 Table: ${tableName}`);
      try {
        const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
        columns.forEach(col => {
          console.log(`   - ${col.Field} | ${col.Type} | Null: ${col.Null} | Key: ${col.Key}`);
        });
      } catch (colErr) {
        console.error(`[${ts()}] ❌ Error fetching columns for table ${tableName}:`, colErr.message);
      }
    }

    await pool.end();
    console.log(`\n[${ts()}] ✅ All tables processed successfully`);
  } catch (err) {
    console.error(`[${ts()}] ❌ DB Error:`, err.stack || err);
    if (pool) await pool.end();
  }
})();
