const express = require('express');
const router = express.Router();
const { registrarTrabajador, loginTrabajador } = require('../models/trabajador');


// GET login
// Ruta para el login
router.get('/login', (req, res) => {
    res.render('login', {title: 'Didadent'});
});

// POST login
router.post('/login', async (req, res) => {
    const correo = req.body.correo;
    const contraseña = req.body.contraseña;

    try {
        let usuario = await loginTrabajador(correo, contraseña);
        let tipoUsuario = 'trabajador';

        if (!usuario) {
            usuario = await loginPaciente(correo, contraseña);
            tipoUsuario = 'paciente';
        }

        if (usuario) {
            //? variables de sesión
            req.session.loggedin = true;
            req.session.name = usuario.nombre;
            req.session.tipo = tipoUsuario; // tipo de usuario en la app
            //alert de confirmación de  inicio de sesión
            res.render('login', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'success',
                    titulo: 'Sesión iniciada',
                    texto: 'Bienvenido, ' + usuario.nombre,
                    tiempo: 2000,
                    ruta: tipoUsuario === 'paciente' ? 'zona/paciente/pedirCita' : 'zona/trabajador/horario' //según el tipo de usuario mandar a la zona determinada
                }
            });
        } else {
            res.render('login', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'error',
                    titulo: 'Error!',
                    texto: 'Revise el usuario u contarseña introducidos',
                    tiempo: 3000,
                    ruta: 'autenticacion/login'
                }
            });
        }
    } catch (err) {
        res.render('login', {
            title: 'Didadent',
            mensaje: {
                tipo: 'error',
                titulo: 'Error del sistema',
                texto: 'Hubo un problema al iniciar sesión. Inténtalo más tarde.',
                tiempo: 3000,
                ruta: 'autenticacion/login'
            }
        });
    }


});


// GET registro
// Ruta para registrarse
router.get('/registrarse', (req, res) => {
    res.render('registrarse', {title: 'Didadent'});
});

// POST registro
router.post('/registrarse', async (req, res) => {

    const rol = req.body.rol;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const correo = req.body.correo;
    const tlf = req.body.tlf;
    const estado = req.body.estado;
    const especialidad = req.body.especialidad;
    const contraseña = req.body.contraseña;

    //console.log("Estoy en registro con" + correo);


    // Llamamos al modelo para registrar al trabajador
    try {
        const resultado = await registrarTrabajador(rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña);

        if (resultado.error) {
            // Error si ya existe ese correo
            return res.render('registrarse', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'error',
                    titulo: 'Error!',
                    texto: resultado.error,  // El error de correo duplicado
                    tiempo: 3000,
                    ruta: 'autenticacion/registrarse'  // Ruta para volver al formulario
                }
            });
        } else {
            // si Todo correcto
            res.render('registrarse', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'success',
                    titulo: 'Registro exitoso',
                    texto: 'El trabajador ha sido registrado correctamente.',
                    tiempo: 3000,
                    ruta: 'autenticacion/login'  
                }
            });
        }
    } catch (err) {
        // Error del sistema
        res.render('registrarse', {
            title: 'Didadent',
            mensaje: {
                tipo: 'error',
                titulo: 'Error del sistema',
                texto: 'Hubo un problema al registrar al trabajador. Inténtalo más tarde.',
                tiempo: 3000,
                ruta: 'autenticacion/registrarse'
            }
        });
    }
});




// GET logout (si quieres activarlo)
router.get('/logout', (req, res) => {
    req.session.destroy(()=>{
        res.redirect('/')
    })
});

module.exports = router;
