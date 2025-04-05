var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session'); //sesion
const dotenv = require('dotenv'); //dotnv
const bcrypt = require("bcryptjs"); // Para encriptar y comparar contraseñas
const conectarDB = require("./conexion/conexion"); // Conexión a la base de datos


const passport = require("./config/passport"); // ✅ Importa passport bien

//importaciónes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var autenticacionRouter = require('./routes/autenticacion'); // Asegúrate de que esta línea esté presente
const { env } = require('process');


var app = express();

app.use(express.urlencoded({extended:false}));
//& 
app.use(express.json())


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//configurar sesiones (cambiado a true)
app.use(session({
  secret: 'mysecretsession',
  resave: true,
  saveUninitialized: true
}));

//? Inicializa passport **después** de configurar las sesiones
app.use(passport.initialize()); // ✅ Inicializa passport
app.use(passport.session()); // ✅ Habilita sesiones si las usas

//& configrar dotenv
dotenv.config({path:'./env/.env'})


//* DIRECTORIOS
app.use('/', indexRouter);
app.use('/users', usersRouter);

//?Autenticación
app.use('/autenticacion', autenticacionRouter);



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
