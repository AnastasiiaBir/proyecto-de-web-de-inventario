// app.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');

const app = express(); // твой основной express-файл
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// --- Rutas ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const proveedoresRoutes = require('./routes/proveedores');
const localizacionesRoutes = require('./routes/localizaciones');

// --- Configuración de la sesión ---
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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

// Раздаём публичные файлы
// app.use(express.static('public')); // уже есть?
// Раздаём папку uploads
// app.use('/uploads', express.static('public/uploads'));

// --- Client-side logging ---
app.post('/_log', (req, res) => {
  const { where, msg } = req.body || {};
  console.log(`[CLIENT LOG] ${where || 'unknown'}: ${msg}`);
  res.sendStatus(204); // исправлено
});

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

// --- 404 обработка ---
app.use((req, res) => {
  console.warn(`404 - Not Found: ${req.originalUrl}`);
  res.status(404).render('404', { url: req.originalUrl });
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