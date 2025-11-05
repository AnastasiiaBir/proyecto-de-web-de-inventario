// testLogin.js
const pool = require('./config/db');
const readline = require('readline');
const bcrypt = require('bcrypt');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Введите email пользователя для проверки: ', async (email) => {
  rl.question('Введите пароль для проверки: ', async (password) => {
    try {
      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      if (rows.length > 0) {
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          console.log('✅ Логин успешен!', user);
        } else {
          console.log('❌ Пароль неверный');
        }
      } else {
        console.log('❌ Пользователь не найден');
      }
    } catch (err) {
      console.error('Ошибка запроса к БД:', err);
    } finally {
      rl.close();
      pool.end();
    }
  });
});
