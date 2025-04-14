const express = require('express');
const { session } = require('passport');
const router = express.Router();

//Rutas desde aqui empiezan con --> /zona/trabajador


// GET horario
// Ruta para el horario del trabajador
router.get('/horario', (req, res) => {
    res.render('trabajadores/horario', {title: 'Didadent', name: req.session.name});
});

// POST horario
router.post('/horario', async (req, res) => {

    res.render('trabajadores/horario', {
        title: 'Didadent',
        login: true,
        name: req.session.name
    })

});

// GET buscador pacientes
// Ruta para el buscador de pacientes
router.get('/pacientes', (req, res) => {
    res.render('trabajadores/buscadorPacientes', {title: 'Didadent', name: req.session.name});
});
// POST buscador pacientes
router.post('trabajadores/buscadorPacientes', async (req, res) => {

    res.render('buscadorPacientes', {
        title: 'Didadent',
        login: true,
        name: req.session.name
    })

});



module.exports = router;