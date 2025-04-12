const express = require('express');
const { session } = require('passport');
const router = express.Router();

// GET horario
// Ruta para el horario del trabajador
router.get('/horario', (req, res) => {
    res.render('horario', {title: 'Didadent', name: req.session.name});
});

// POST horario
router.post('/horario', async (req, res) => {

    res.render('horario', {
        title: 'Didadent',
        login: true,
        name: req.session.name
    })

});



module.exports = router;