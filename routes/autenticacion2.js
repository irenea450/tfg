const express = require('express');
const passport = require('passport');
const router = express.Router();

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render('login', { message: req.flash('se ha producido un error al iniciar sesión') }); // Renderiza la vista del login
});

// Ruta para manejar el login
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',  // Redirigir a home si el login es correcto
    failureRedirect: '/autenticacion/login',  // Volver a login si hay error
    failureFlash: true
}));


// Ruta para el formulario de registro
router.get("/registrarse", (req, res) => {
    res.render("registrarse", {
        messages: req.flash()  // Pasamos los mensajes flash a la vista
    });
});

// Ruta para registrar un trabajador
router.post("/registrarse",
    passport.authenticate("local-registrarse", {
        successRedirect: "/autenticacion/login",
        failureRedirect: "/autenticacion/registrarse",
        failureFlash: true  // Habilita los mensajes flash en caso de fallo
    })
);


//! Ruta para mostrar el formulario de registro (signup)
/* router.get('/registrarse', (req, res) => {
    res.render('registrarse', { message: req.flash('te registrate exitosamente') });
});
 */
//! Ruta para manejar el registro de usuarios
/* router.post('/registrarse', async (req, res) => {
    try {
        // Aquí iría la lógica para registrar el usuario en la base de datos
        res.redirect('/autenticacion/login'); // Redirige al login tras registrarse
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.redirect('/autenticacion/registrarse');
    }
}); */

// Ruta para cerrar sesión
/* router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
}); */

module.exports = router;
