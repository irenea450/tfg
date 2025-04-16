const express = require('express');
const session = require('express-session'); //sesion
const router = express.Router();
const { horarioTrabajador, festivosTrabajador , obtenerDiasLaborablesSemanaActual } = require('../models/trabajador');

//Rutas desde aqui empiezan con --> /zona/trabajador


// GET horario
// Ruta para el horario del trabajador
router.get('/horario', async (req, res) => {
    console.log("con el usaurio de id: " + req.session.usuarioId);

    //sacar horario semanal del trabajador
    let horario = await horarioTrabajador(req.session.usuarioId);

    let diasLaborablesSemanaActual = await obtenerDiasLaborablesSemanaActual();

    console.log("Fechas de la semana actual:", diasLaborablesSemanaActual);

    let festivos = await festivosTrabajador(diasLaborablesSemanaActual);
    console.log(festivos);

    res.render('trabajadores/horario', {
        title: 'Didadent',
        login: true,
        name: req.session.name,
        horarioTrabajador: horario,//paso el horario
        diasLaborablesSemanaActual: diasLaborablesSemanaActual,
        festivosSemana: festivos
    })
});

// POST horario
router.post('/horario', async (req, res) => {

//no se necesita el post hasta que no haga un formulario

});

// GET buscador pacientes
// Ruta para el buscador de pacientes
router.get('/pacientes', (req, res) => {
    res.render('trabajadores/buscadorPacientes', {title: 'Didadent',
        login: true,
        name: req.session.name});
});
// POST buscador pacientes
/* router.post('trabajadores/buscadorPacientes', async (req, res) => {

    res.render('buscadorPacientes', {
        title: 'Didadent',
        login: true,
        name: req.session.name
    })

}); */



module.exports = router;