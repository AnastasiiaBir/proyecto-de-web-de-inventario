// hashPassword.js
import bcrypt from 'bcrypt';

const password = '123456'; // пароль, который хотим зашифровать
const saltRounds = 10;

const generateHash = async () => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Хэш пароля для 123456:');
  console.log(hashedPassword);
};

generateHash();