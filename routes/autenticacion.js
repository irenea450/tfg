const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require("bcryptjs"); // Para encriptar y comparar contraseñas
const { registrarTrabajador } = require('../models/trabajador');


// GET login
// Ruta para el login
router.get('/login', (req, res) => {
    res.render('login');
});

// POST login
router.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.session.mensajeLogin = info.message || 'Error al iniciar sesión.';
            return res.redirect('/autenticacion/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
});


// GET registro
// Ruta para registrarse
router.get('/registrarse', (req, res) => {
    res.render('registrarse');
});

// POST registro
router.post('/registrarse', (req, res) => {

    const rol = req.body.rol;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const correo = req.body.correo;
    const tlf = req.body.tlf;
    const estado = req.body.estado;
    const especialidad = req.body.especialidad;
    const contraseña = req.body.contraseña;

    console.log("Estoy en registry funciona" + correo);


    // Llamamos al modelo para registrar al trabajador
    const insert =  registrarTrabajador(rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña);

    console.log("he hecho el insert ")


    if (insert){
        return res.redirect('/autenticacion/login');
    }

});


// GET logout (si quieres activarlo)
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/autenticacion/login');
    });
});

module.exports = router;
