var express = require('express');
const mysql = require('mysql');
var router = express.Router();

var bd=require("../conexion/conexion"); //importar bbdd


/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('index', {title: 'Didadent'});
  /* res.render('index', {
    title: 'Didadent',
    mensaje: {
      tipo: 'success',
      titulo: '¡Bienvenida!',
      texto: 'Has accedido correctamente'
    }
  }); */

});

console.log("Estoy en app")

/* GET pagina sobre Nosotros */
router.get('/sobreNosotros', function (req, res, next) {

  /* res.render('sobreNosotros', { title: 'Didadent' }); */

  //!probar login y variables de sesión, solo se puede acceder si estas logueado
  if(req.session.loggedin){
    res.render('sobreNosotros', {
      title: 'Didadent',
      login: true,
      name: req.session.name
    })
  }else{
    res.render('sobreNosotros', {
      title: 'Didadent',
      login: true,
      name: 'Debe iniciar sesión'
    })
  }
});




module.exports = router;
