var express = require('express');
const mysql = require('mysql');
var router = express.Router();

var bd=require("../conexion/conexion"); //importar bbdd

//&prueba
const { obtenerTrabajadores, insertarTrabajador } = require('../models/trabajador');

/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('index', { title: 'Didadent' });

  //comprobar conexion
/*   async function obtenerTrabajadores() {
    try {
        const connection = await bd();
        const [rows] = await connection.execute("SELECT * FROM trabajador");
        console.log(rows);
        await connection.end(); // Cerrar conexión después de usarla
    } catch (error) {
        console.error("❌ Error al obtener trabajadores:", error.message);
    }
}

// Llamar a la función para probar
obtenerTrabajadores(); */


});



/* GET pagina sobre Nosotros */
router.get('/sobreNosotros', function (req, res, next) {

  res.render('sobreNosotros', { title: 'Didadent' });
});


//& Ruta para obtener todos los trabajadores
router.get('/test-trabajadores', async (req, res) => {
  try {
      const trabajadores = await obtenerTrabajadores();
      console.log("Trabajadores obtenidos:", trabajadores); // Muestra en la consola del servidor
      res.send("Mira la consola del servidor para ver los datos");
  } catch (error) {
      console.error("Error al obtener trabajadores:", error);
      res.status(500).send("Error al obtener trabajadores"); //! Aqui salta el error
  }
});

module.exports = router;
