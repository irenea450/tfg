const express = require('express');
const router = express.Router();

//importar desde el atchivo de funciones comunes
const { citasPendientesId ,anularCita
} = require('../models/funciones');

//improtar funciones de paciente.js
const { obtenerPacienteId, obtenerTrabajadoresParaCita , obtenerDisponibilidadDelTrabajador , obtenerHorasDisponibles ,
    calcularHoraFinCita, insertarCitaPaciente , insertarCitaTrabajador , obtenerInformes , guardarContraseñaPaciente , guardarDatosPaciente
} = require('../models/paciente');

//controles de acceso
const { estaLogueado, soloPacientes } = require('../middlewares/acceso.js');


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

router.post('/pedirCitaPaciente', estaLogueado, async (req, res) => {
    try {
        const id_paciente = req.session.usuarioId;
        const {
            motivoSelect,
            id_trabajador,
            fecha_cita,
            hora_cita,
            duracion,
            id_auxiliar //en caso de ser una ortodoncia
        } = req.body;

        console.log("Recibo al enviar el formualrio lo siguinete: " + " IdPaciente: " + id_paciente + " IdTrabajador: " + id_trabajador 
            + " motivo: " + motivoSelect + " fecha: " + fecha_cita + " hora: " + hora_cita + " duración: " + duracion);

        // Validar los datos recibidos
        if (!id_paciente || !motivoSelect || !id_trabajador || !fecha_cita || !hora_cita) {
            return res.status(400).send("Faltan datos obligatorios");
        }

        // Validación especial para ortodoncia
        if (motivoSelect === "Ortodoncia" && !id_auxiliar) {
            return res.status(400).send("Para ortodoncia se requiere un auxiliar");
        }


        //llamamos a la función de insertar la cita (dentro va a calcular las horas final, por lo que hay que pasar la duración)
        const cita = await insertarCitaPaciente(id_paciente, fecha_cita, hora_cita, duracion, motivoSelect);

        const cita_trabajador = await insertarCitaTrabajador(cita, id_trabajador);

        // Si es ortodoncia, insertar relación con el auxiliar
        if (motivoSelect === "Ortodoncia" && id_auxiliar) {
            await insertarCitaTrabajador(cita, id_auxiliar);
        }

        //aqui devolver que ha sido correcto
        res.json({ mensaje: 'Se ha creado la cita con éxito' });
        
    } catch (error) {
        console.error("Error al crear cita:", error);
        res.redirect('/zona/paciente/pedirCita');
    }
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
// Ruta para obtener días disponibles
router.get('/disponibilidad/dias', async (req, res) => {
    const { trabajador, duracion } = req.query;
    try {
        const disponibilidad = await obtenerDisponibilidadDelTrabajador(trabajador, duracion);
        res.json(disponibilidad.fechas);
    } catch (err) {
        console.error("Error en /disponibilidad/dias:", err);
        res.status(500).json({ error: err.message });
    }
});

// Ruta para obtener horas de un día específico
router.get('/disponibilidad/horas', async (req, res) => {
    const { trabajador, fecha, duracion } = req.query;
    try {
        const horas = await obtenerHorasDisponibles(trabajador, fecha, duracion);
        res.json(horas);
    } catch (err) {
        console.error("Error en /disponibilidad/horas:", err);
        res.status(500).json({ error: err.message });
    }
});

/* -------------------------------------------------------------------------- */
/*                                  Informes                                  */
/* -------------------------------------------------------------------------- */

// GET informes
// Ruta para ver informes por parte de los pacientes
// Renderizar la página de informes
router.get('/informes', estaLogueado, async(req, res) => {
    try {
        const id_paciente = req.session.usuarioId;

        //obtenemos todos los informes de el paciente
        const informes = await obtenerInformes(id_paciente);
        
        // Ordenar por fecha descendente (de más nuevo a más viejo)
        informes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        res.render('pacientes/informes', {
            title: 'Didadent',
            name: req.session.name,
            informes: informes // pasamos informe
        });
    } catch (error) {
        console.error('Error al obtener informes:', error);
        res.status(500).render('error', { mensaje: 'Error al cargar informes' });
    }
});


/* -------------------------------------------------------------------------- */
/*                               Datos Paciente                               */
/* -------------------------------------------------------------------------- */
// GET datos paciente
// Ruta para ver los datos del paciente
router.get('/datos',estaLogueado, soloPacientes, async (req, res) => {

    const paciente = (await obtenerPacienteId(req.session.usuarioId))[0]; //para acceder al primer objeto que es nuestro paciente

    res.render('pacientes/datosPaciente', {title: 'Didadent',
        name: req.session.name,
        paciente: paciente
    });
});
// POST datos trabajador
router.post('/datos', async (req, res) => {

    const id = req.session.usuarioId;
    const rol = 1;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const fecha_nacimiento = req.body.fecha_nacimiento;
    const sexo = req.body.sexo;
    const correo = req.body.correo;
    const tlf = req.body.tlf;
    const domicilio = req.body.domicilio;


    console.log({ id, rol, nombre, apellidos, correo, fecha_nacimiento, sexo,tlf,domicilio });

    const guadarDatos = guardarDatosPaciente(id,rol,nombre,apellidos,correo,tlf,domicilio,fecha_nacimiento,sexo);


    //Una vez realizado volver a hacer la consulta para ver los datos
    const paciente = (await obtenerPacienteId(req.session.usuarioId))[0];
    //console.log('Trabajador recuperado:', JSON.stringify(trabajador, null, 2));

    res.render('pacientes/datosPaciente', {
        title: 'Didadent',
        name: req.session.name,
        paciente: paciente,
        mensajeExito: 'Datos actualizados correctamente.'
    })
});

// POST cambiar contarseña
router.post('/contrasena', async (req, res) => {
    const id = req.session.usuarioId;
    const nuevaContraseña = req.body.contraseña;
    const confirmarContraseña = req.body.confrimarContraseña;

    let paciente = (await obtenerPacienteId(id))[0];

    //Comprobar si las dos contraseñas introducidas son iguales
    if (nuevaContraseña !== confirmarContraseña) {
        return res.render('pacientes/datosPaciente', {
            title: 'Didadent',
            name: req.session.name,
            paciente,
            mensajeError: 'Las contraseñas no coinciden.' //mensaje de confirmación
        });
    }

    try {

        //llamamos a la función para guaradar las contarseñas
        const guardarContraseña = guardarContraseñaPaciente(id,nuevaContraseña);

        res.render('pacientes/datosPaciente', {
            title: 'Didadent',
            name: req.session.name,
            paciente,
            mensajeExito: 'Contraseña actualizada correctamente.'
        });

    } catch (error) {
        console.error("❌ Error al cambiar contraseña:", error.message);
        res.render('pacientes/datosPaciente', {
            title: 'Didadent',
            name: req.session.name,
            paciente,
            mensajeError: 'Ha ocurrido un error al actualizar la contraseña.'
        });
    }
});


module.exports = router;