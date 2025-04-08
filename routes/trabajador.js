const express = require('express');
const router = express.Router();

// GET horario
// Ruta para el horario del trabajador
router.get('/horario', (req, res) => {
    res.render('horario', {title: 'Didadent'});
});

// POST horario
router.post('/horario', async (req, res) => {

    res.render('horario', {title: 'Didadent'});

});



module.exports = router;