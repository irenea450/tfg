var express = require('express');
const mysql = require('mysql');
const session = require('express-session'); //sesion
var router = express.Router();

var bd=require("../conexion/conexion"); //importar bbdd

const { enviarEmailContacto } = require('../services/email');



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
router.get('/contacto', function (req, res, next) {

  res.render('contacto', { title: 'Didadent' });


});

/* GET pagina derechosAutor */
router.get('/derechosAutor', function (req, res, next) {

  res.render('derechosAutor', { title: 'Didadent' });


});

// POST para el formulario de contacto
router.post('/enviar-mensaje', async (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    try {
        // Validación básica
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ 
                success: false,
                message: 'Todos los campos son requeridos' 
            });
        }

        // Enviar email
        await enviarEmailContacto(nombre, email, asunto, mensaje);

        // Respuesta exitosa
        res.json({ 
            success: true,
            message: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.' 
        });

    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ 
            success: false,
            message: 'Hubo un error al enviar tu mensaje. Por favor inténtalo nuevamente.' 
        });
    }
});



module.exports = router;
