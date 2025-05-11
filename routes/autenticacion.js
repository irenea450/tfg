const express = require('express');
const router = express.Router();
const session = require('express-session'); //sesion
const { registrarTrabajador, loginTrabajador } = require('../models/trabajador');
const { registrarPaciente, loginPaciente , guardarContraseñaPaciente, obtenerPacienteId } = require('../models/paciente');

const { estaLogueado } = require('../middlewares/acceso.js');

const { registroEmail , recuperarContraseñaEmail } = require('../services/email');



// GET login
// Ruta para el login
router.get('/login', (req, res) => {
    res.render('login', { title: 'Didadent' });
});

// POST login
router.post('/login', async (req, res) => {
    const correo = req.body.correo;
    const contraseña = req.body.contraseña;

    try {
        let usuario = await loginTrabajador(correo, contraseña);


        if (!usuario || usuario.error) {
            usuario = await loginPaciente(correo, contraseña);
        }
        
        let tipoUsuario;
        //define el tipo de usuario que se ha registrado según su rol
        if (usuario.rol === 1) {
            tipoUsuario = 'paciente';
        } else {
            tipoUsuario = 'trabajador';
        }
        console.log("soy de tipo" + tipoUsuario);

        //En caso de que la autenticación sea rechazada lanzar mensaje de error de autenticación
        if (usuario.error) {
            res.render('login', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'error',
                    titulo: 'Error de autenticación!',
                    texto: "Revise el usuario y la contraseña",
                    tiempo: 3000,
                    ruta: 'autenticacion/login'
                }
            });
        } else {
            //* Sesión iniciada con éxito
            //? variables de sesión
            req.session.loggedin = true;
            req.session.usuarioId = usuario.id_trabajador || usuario.id_paciente  ;
            console.log("autenticado con el usuario con id: " + req.session.usuarioId);
            req.session.rol = usuario.rol;
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
                    ruta: tipoUsuario === 'paciente' ? 'zona/paciente/inicio' : 'zona/trabajador/horario' //según el tipo de usuario mandar a la zona determinada
                }
            });
        }
    } catch (err) {
        //En caso de error en la base de datos o en el registro
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

/* ------------------------------ Para paciente ----------------------------- */
// GET registrar paciente
// Ruta para registrar paciente
router.get('/registrarPaciente', (req, res) => {
    res.render('registrarPaciente', { title: 'Didadent' });
});

// POST registro
router.post('/registrarPaciente', async (req, res) => {

    const rol = 1; //. todos los pacientes son rol 1
    const id = req.body.dni;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const correo = req.body.correo;
    const tlf = req.body.tlf;
    const fecha_nacimiento = req.body.fecha_nacimiento;
    const sexo = req.body.sexo;
    const contraseña = req.body.contraseña;

    const calle = req.body.calle;
    const numero = req.body.numero;
    const puerta = req.body.puerta;
    const cp = req.body.cp;
    const domicilio = calle + ", " + numero + ", " + puerta + ", cp:" + cp;

    console.log("He recogidos los datos del usuario " + correo);


    // Llamamos al modelo para registrar al trabajador
    try {
        const resultado = await registrarPaciente(rol,id, nombre, apellidos, correo, tlf, domicilio, fecha_nacimiento, sexo, contraseña);

        if (resultado.error) {
            // Error si ya existe ese correo
            return res.render('registrarPaciente', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'error',
                    titulo: 'Error en el registro!',
                    texto: resultado.error,  // El error de correo duplicado
                    tiempo: 3000,
                    ruta: 'autenticacion/registrarPaciente'  // Ruta para volver al formulario
                }
            });
        } else {
            // si Todo correcto
            const nombreCompleto = nombre + " " + apellidos;

            // Envía el correo de confirmación
            await registroEmail(correo, nombreCompleto);

            res.render('registrarPaciente', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'success',
                    titulo: 'Registro exitoso',
                    texto: 'El usuario ha sido registrado correctamente.',
                    tiempo: 3000,
                    ruta: 'autenticacion/login'  // mandar al login una vez se crea la cuenta
                }
            });
        }
    } catch (err) {
        // Error del sistema
        res.render('registrarPaciente', {
            title: 'Didadent',
            mensaje: {
                tipo: 'error',
                titulo: 'Error del sistema',
                texto: 'Hubo un problema al registrar al usuario. Inténtalo más tarde.',
                tiempo: 3000,
                ruta: 'autenticacion/registrarPaciente'
            }
        });
    }
});

/* ----------------------------- Para trabajador ---------------------------- */
// GET registrarTrabajador
// Ruta para registrarTrabajador
router.get('/registrarTrabajador',estaLogueado, (req, res) => {
    res.render('registrarTrabajador', { title: 'Didadent', name: req.session.name  });
});

// POST registro
router.post('/registrarTrabajador', async (req, res) => {

    const rol = req.body.rol;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const correo = req.body.correo + "@didadent.com"; //añadimos terminación
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
            return res.render('registrarTrabajador', {
                title: 'Didadent',
                name: req.session.name,
                mensaje: {
                    tipo: 'error',
                    titulo: 'Correo en uso!',
                    texto: resultado.error,  // El error de correo duplicado
                    tiempo: 3000,
                    ruta: 'autenticacion/registrarTrabajador'  // Ruta para volver al formulario
                }
            });
        } else {
            // si Todo correcto
            res.render('registrarTrabajador', {
                title: 'Didadent',
                name: req.session.name,
                mensaje: {
                    tipo: 'success',
                    titulo: 'Registro exitoso',
                    texto: 'El trabajador ha sido registrado correctamente.',
                    tiempo: 3000,
                    ruta: 'zona/trabajador/configuracion'  // redirigir a configuración en caso de exito
                }
            });
        }
    } catch (err) {
        // Error del sistema
        res.render('registrarTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            mensaje: {
                tipo: 'error',
                titulo: 'Error del sistema',
                texto: 'Hubo un problema al registrar al trabajador. Inténtalo más tarde.',
                tiempo: 3000,
                ruta: 'autenticacion/registrarTrabajador'
            }
        });
    }
});

/* ---------------------- recuperar contraseña paciente --------------------- */
// GET registrar paciente
// Ruta para registrar paciente
router.get('/recuperarContrasena', (req, res) => {
    res.render('recuperarContrasena', { title: 'Didadent' });
});

// POST recuperar contraseña
router.post('/recuperarContrasena', async (req, res) => {
    const dni = req.body.dni;

    try {
        // ver si el apciente exste y sacar datos
        const paciente = await obtenerPacienteId(dni);

        if (!paciente || paciente.length === 0) {
            return res.render('recuperarContrasena', {
                title: 'Didadent',
                mensaje: {
                    tipo: 'error',
                    titulo: 'Error',
                    texto: 'No existe un paciente con ese DNI',
                    tiempo: 3000,
                    ruta: 'autenticacion/recuperarContrasena'
                }
            });
        }

        // contarseña aleatoria de 6 dígitos
        const nuevaContraseña = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

        // guardar la nueva contrseña
        const guardarContraseña = await guardarContraseñaPaciente(dni, nuevaContraseña);

        // enviar emial con la nueva contraseña
        const enviarEmail = await recuperarContraseñaEmail(paciente[0].correo, `${paciente[0].nombre} ${paciente[0].apellidos}`, nuevaContraseña);

        // mensaje de exito
        res.render('recuperarContrasena', {
            title: 'Didadent',
            mensaje: {
                tipo: 'success',
                titulo: 'Contraseña enviada',
                texto: 'Se ha enviado una nueva contraseña a tu correo electrónico',
                tiempo: 3000,
                ruta: 'autenticacion/login'
            }
        });

    } catch (err) {
        //error
        console.error('Error en recuperarContrasena:', err);
        res.render('recuperarContrasena', {
            title: 'Didadent',
            mensaje: {
                tipo: 'error',
                titulo: 'Error del sistema',
                texto: 'Hubo un problema al recuperar la contraseña. Inténtalo más tarde.',
                tiempo: 3000,
                ruta: 'autenticacion/login'
            }
        });
    }
});



// GET logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
});

module.exports = router;
