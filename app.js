// app.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const http = require('http');
const Sentry = require('@sentry/node');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// --- Логи переменных окружения ---
console.log('=== ENV INFO ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);
console.log('================');

// --- Inicialización de Sentry ---
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// --- Middleware Sentry для обработки запросов (до маршрутов) ---
app.use(Sentry.Handlers ? Sentry.Handlers.requestHandler() : (req, res, next) => next());

// --- Подключение к БД для теста ---
const testPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    mode: 'REQUIRED',           // обязательный SSL
    rejectUnauthorized: false   // игнор self-signed сертификатов
  } // Render/Aiven
}).promise();

testPool.getConnection()
  .then(conn => {
    console.log('✅ DB Connected Successfully! Connection ID:', conn.threadId);
    conn.release();
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err.stack || err);
  });

// --- Configuración de la sesión ---
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    mode: 'REQUIRED',           // обязательный SSL
    rejectUnauthorized: false   // игнор self-signed сертификатов
  } // для Aiven/Render
});

app.use(session({
  key: 'inventario_session',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// --- Seguridad y limitación de solicitudes ---
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:"]
    }
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// --- Configuración de EJS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- SEO: Sitemap y Robots.txt ---
// создаём маршруты для отдачи sitemap и robots.txt
app.get('/seo/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'seo', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.header('Content-Type', 'application/xml');
    res.sendFile(sitemapPath);
  } else {
    console.warn('Sitemap not found');
    res.status(404).send('Sitemap not found');
  }
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: http://localhost:3000/seo/sitemap.xml`);
});

// --- Client-side logging ---
app.post('/_log', (req, res) => {
  const { where, msg } = req.body || {};
  console.log(`[CLIENT LOG] ${where || 'unknown'}: ${msg}`);
  res.sendStatus(204);
});

// --- Rutas ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const proveedoresRoutes = require('./routes/proveedores');
const localizacionesRoutes = require('./routes/localizaciones');

// Раздаём публичные файлы
// app.use(express.static('public')); // уже есть?
// Раздаём папку uploads
// app.use('/uploads', express.static('public/uploads'));

// --- Rutas ---
app.use('/', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/categorias', categoriasRoutes);
// app.use('/productos', productosRoutes);
app.use('/admin/productos', productosRoutes);
app.use('/admin/usuarios', usuariosRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/localizaciones', localizacionesRoutes);

// Доверяем прокси, чтобы Express правильно считывал X-Forwarded-For
app.set('trust proxy', 1);

// --- Páginas legales ---
app.get('/aviso-legal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'aviso-legal.html'));
});

app.get('/privacidad', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy-policy.html'));
});

app.get('/cookies', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cookies-policy.html'));
});

// --- 404 обработка ---
app.use((req, res) => {
  console.warn(`404 - Not Found: ${req.originalUrl}`);
  res.status(404).render('404', { url: req.originalUrl });
});

// --- Integración Sentry para errores ---
app.use(Sentry.Handlers ? Sentry.Handlers.errorHandler() : (err, req, res, next) => next(err));

// --- Обработка ошибок ---
app.use((err, req, res, next) => {
  console.error('❌ ERROR CAPTURED:', err.message);
  res.status(500).send('Algo salió mal!');
});

app.locals.io = io;
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado');
});


// --- Servidor ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});