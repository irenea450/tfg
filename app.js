var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session'); //sesion
const bcrypt = require("bcryptjs"); // Para encriptar y comparar contraseñas
const conectarDB = require("./conexion/conexion"); // Conexión a la base de datos
//? nodemailer
require('dotenv').config(); // Debe ser lo PRIMERO en ejecutarse


//* Importaciónes de routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var autenticacionRouter = require('./routes/autenticacion'); // Asegúrate de que esta línea esté presente
var zonaPacienteRouter = require('./routes/paciente');
var zonaTrabajadorRouter = require('./routes/trabajador');
const { env } = require('process');


var app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json())


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//& cargar sweet alerts
app.use('/sweetalert2', express.static(__dirname + '/node_modules/sweetalert2/dist'));


//configurar sesiones (cambiado a true)
app.use(session({
  secret: 'mysecretsession',
  resave: false,
  saveUninitialized: false
}));



//* DIRECTORIOS
app.use('/', indexRouter);
app.use('/users', usersRouter);
//Autenticación
app.use('/autenticacion', autenticacionRouter);
//zonas
app.use('/zona/paciente', zonaPacienteRouter);
app.use('/zona/trabajador', zonaTrabajadorRouter);


//para limpiar cache
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
