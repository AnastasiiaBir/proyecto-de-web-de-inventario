// test-db.js
const db = require('./models/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');
    console.log('Conexión exitosa, resultado:', rows[0].resultado);
  } catch (error) {
    console.error('Error al conectar con la BD:', error);
  } finally {
    process.exit();
  }
}

testConnection();
