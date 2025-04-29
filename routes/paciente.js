const express = require('express');
const router = express.Router();

//importar desde el atchivo de funciones comunes
const { citasPendientesId ,anularCita
} = require('../models/funciones');

//improtar funciones de paciente.js
const { obtenerPacienteId, obtenerTrabajadoresParaCita , obtenerDisponibilidadDelTrabajador
} = require('../models/paciente');

//controles de acceso
const { estaLogueado } = require('../middlewares/acceso.js');


// GET inicio
// Ruta de la página de inicio del paciente
router.get('/inicio',estaLogueado, async(req, res) => {
    res.render('pacientes/inicio', {title: 'Didadent', name: req.session.name});
});

/* -------------------------------------------------------------------------- */
/*                                    Citas                                   */
/* -------------------------------------------------------------------------- */

// GET citas
// Ruta aqui se gestionan las citas que tiene y redidige a pedir cita en caso de pulsar botón
router.get('/citas',estaLogueado, async (req, res) => {

    //sacar las citas que tiene pendiente el paciente
    let citasPendientes = await citasPendientesId(req.session.usuarioId);

    console.log("Citas pendientes:" + citasPendientes)


    res.render('pacientes/citas', 
        {
            title: 'Didadent', 
            name: req.session.name,
            citas: citasPendientes //pasamos las citas pendientes
        });
});

router.post('/anular-cita/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await anularCita(id);  // Función que cambia el estado a "Anulada"
        res.json({ mensaje: 'Cita anulada correctamente' });
    } catch (err) {
        console.error('Error al anular la cita:', err);
        res.status(500).json({ error: 'Error al anular la cita' });
    }
});

// GET pedirCita
// Ruta para pedirCita por parte del paciente
router.get('/pedirCita',estaLogueado, async(req, res) => {
    id = req.session.usuarioId;

    
    res.render('pacientes/pedirCita', {title: 'Didadent', name: req.session.name , id:id});
});

router.post('/pedirCita',estaLogueado, async(req, res) => {
    id = req.session.usuarioId;

    
    res.render('pacientes/pedirCita', {title: 'Didadent', name: req.session.name , id:id});
});

//? buscar trabajador
router.get('/buscar-trabajadores', async (req, res) => {
    const { keyword1, keyword2 } = req.query;
    try {
        const trabajadores = await obtenerTrabajadoresParaCita(keyword1, keyword2);
        res.json(trabajadores);
    } catch (error) {
        console.error("❌ Error buscando trabajadores:", error.message);
        res.status(500).json({ error: "Error interno al buscar trabajadores" });
    }
});

//? buscar la disponibilidad de ese trabajador
router.get('/disponibilidad', async (req, res) => {
    const { trabajador, duracion } = req.query;
    try {
        const disponibilidad = await obtenerDisponibilidadDelTrabajador(trabajador, duracion);
        res.json(disponibilidad); // { fechas: [...], horas: [...] }
    } catch (err) {
        console.error("❌ Error obteniendo disponibilidad:", err);
        res.status(500).json({ error: "Error obteniendo disponibilidad" });
    }
});

/* -------------------------------------------------------------------------- */
/*                                  Informes                                  */
/* -------------------------------------------------------------------------- */

// GET informes
// Ruta para ver informes por parte de los pacientes
router.get('/informes',estaLogueado, async(req, res) => {
    res.render('pacientes/informes', {title: 'Didadent', name: req.session.name});
});



module.exports = router;