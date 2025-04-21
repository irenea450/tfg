const express = require('express');
const router = express.Router();

// GET pedirCita
// Ruta para pedirCita por parte del paciente
router.get('/pedirCita', (req, res) => {
    res.render('pacientes/pedirCita', {title: 'Didadent'});
});



module.exports = router;