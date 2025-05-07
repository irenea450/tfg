const express = require('express');
const session = require('express-session'); //sesion
const router = express.Router();
const { obtenerTrabajadores, obtenerTrabajadorId, guardarDatosTrabajador, buscarPacientes, obtenerHistorialPaciente, obtenerCitasPendientes,
    horarioTrabajador, festivosTrabajador, vacacionesTrabajador, obtenerDiasLaborablesSemanaActual, citasTrabajador, consultarCita, obtenerPacienteId,
    actualizarCita, anularCita, completarCita, crearInforme, guardarContraseñaTrabajador, solicitarVacaciones, obtenerVacacionesId, eliminarVacacion,
    obtenerHorarioTrabajador, insertarHorarioTrabajador, actualizarHorario, eliminarHorario, solicitarFestivos, obtenerFestivos, eliminarFestivos,
    insertarCitaEnTrabajador
} = require('../models/trabajador');

//para proteger las routes
const { estaLogueado, soloTrabajadores, accesoAdmin } = require('../middlewares/acceso.js');
const { insertarCitaTrabajador } = require('../models/funciones.js');

//Rutas desde aqui empiezan con --> /zona/trabajador


// GET horario
// Ruta para el horario del trabajador
router.get('/horario', estaLogueado, soloTrabajadores, async (req, res) => {
    console.log("con el usaurio de id: " + req.session.usuarioId);

    //?sacar horario semanal del trabajador
    let horario = await horarioTrabajador(req.session.usuarioId);

    //?obtener los dias laborables de las semana actual , para impirmirlo en el horario
    let diasLaborablesSemanaActual = await obtenerDiasLaborablesSemanaActual();
    //console.log("Fechas de la semana actual:", diasLaborablesSemanaActual);

    //?obtener los festivos que tiene la clínica y si coinciden con los dias de esa semana marcar
    let festivos = await festivosTrabajador(diasLaborablesSemanaActual);
    //console.log(festivos);
    //?obtener los días de vacaciones del trabajador y si coinciden con los dias de esa semana marcar
    let vacaciones = await vacacionesTrabajador(diasLaborablesSemanaActual, req.session.usuarioId);
    //console.log("Vacaciones que se van a mostrar " + vacaciones);

    //?obtener citas que tiene pendientes el trabajador
    let citas = await citasTrabajador(req.session.usuarioId)

    //~filtramos las citas que estan dentro de la semana actual
    const citasSemana = citas.filter(cita => {
        const fechaCita = new Date(cita.fecha).toLocaleDateString('es-ES'); //poner formato DD/MM/YYYY
        return diasLaborablesSemanaActual.includes(fechaCita);
    });
    //console.log("citas pendientes esta semana" + citasSemana);

    res.render('trabajadores/horario', {
        title: 'Didadent',
        login: true,
        name: req.session.name,
        horarioTrabajador: horario,//paso el horario
        diasLaborablesSemanaActual: diasLaborablesSemanaActual, //dias de la semana
        festivosSemana: festivos, //festivos
        vacacionesSemana: vacaciones, //vacaciones
        citasSemana: citasSemana  //citas de la semana actual 
    })
});


// POST de horario (para que funcione correctamente formulario de informe)
router.post('/horario', async (req, res) => {

    // Lógica para manejar la petición POST a /zona/trabajador/horario
    res.send('Petición POST recibida en /zona/trabajador/horario');

});

// GET consultra cita
// Ruta para consultra la cita que se seleccione
router.get('/consultar-cita/:id', estaLogueado, soloTrabajadores, async (req, res) => {
    const id = req.params.id;
    try {
        // Obtener los datos de la cita
        const cita = await consultarCita(id);
        console.log('Cita obtenida:', cita);

        if (cita && cita.length > 0) {
            const idPaciente = cita[0].id_paciente; // Asegurarse de que 'cita' es un array y acceder al primer elemento

            // Consultar el paciente asociado a la cita
            const paciente = await obtenerPacienteId(idPaciente);
            console.log('Paciente Obtenido:', paciente);

            // Enviar los datos de la cita y el paciente en una sola respuesta
            res.setHeader('Cache-Control', 'no-store');
            res.json({ cita: cita[0], paciente: paciente });  // Devolver ambos objetos en un solo JSON
        } else {
            res.status(404).json({ error: 'Cita no encontrada' });
        }

    } catch (err) {
        console.error('Error al consultar la cita:', err);
        res.status(500).json({ error: 'Error al obtener la cita' });
    }
});

// POST guardar cambios en la cita
router.post('/editar-cita', estaLogueado, soloTrabajadores, async (req, res) => {
    const { id_cita, fecha, motivo, hora_inicio, hora_fin } = req.body;
    try {
        // Aquí llamarías a una función de modelo que actualice esos campos en la BBDD
        await actualizarCita(id_cita, fecha, motivo, hora_inicio, hora_fin);
        res.json({ mensaje: 'Cita actualizada correctamente' });
    } catch (err) {
        console.error('Error al editar la cita:', err);
        res.status(500).json({ error: 'Error al editar la cita' });
    }
});

// POST anular cita
router.post('/anular-cita/:id', estaLogueado, soloTrabajadores, async (req, res) => {
    const id = req.params.id;
    try {
        await anularCita(id);  // Función que cambia el estado a "Anulada"
        res.json({ mensaje: 'Cita anulada correctamente' });
    } catch (err) {
        console.error('Error al anular la cita:', err);
        res.status(500).json({ error: 'Error al anular la cita' });
    }
});

// POST para completar cita
router.post('/completar-cita/:id', estaLogueado, soloTrabajadores, async (req, res) => {
    const id = req.params.id;
    try {
        await completarCita(id); // Función que cambia el estado a "Completada"
        res.json({ mensaje: 'Cita completada correctamente' });
    } catch (err) {
        console.error('Error al completar la cita:', err);
        res.status(500).json({ error: 'Error al completar la cita' });
    }
});

// POST para generar informe de cita
router.post('/generar-informe/:idPaciente/:idCita', estaLogueado, soloTrabajadores, async (req, res) => {
    //ids
    const idCita = req.params.idCita;
    const idPaciente = req.params.idPaciente;
    //descripción y fecha
    const descripcion = req.body.descripcion;
    const fecha = req.body.fecha;
    try {
        await crearInforme(idPaciente, idCita, descripcion, fecha); //función para crear el informe en la bbdd
        res.json({ mensaje: 'Informe generado con éxito' });
    } catch (err) {
        console.error('Error al generar el informe:', err);
        res.status(500).json({ error: 'Error al generar informe' });
    }
});


/* -------------------------------------------------------------------------- */
/*                            Buscador de pacientes                           */
/* -------------------------------------------------------------------------- */

// Ruta para el buscador de pacientes
// GET buscador pacientes
router.get('/pacientes', estaLogueado, soloTrabajadores, async (req, res) => {

    //función que devuelve a todos los pacientes
    const pacientes = await buscarPacientes();

    res.render('trabajadores/buscadorPacientes', {
        title: 'Didadent',
        name: req.session.name,
        pacientes: pacientes, // cargar todos los pacientes
        searchTerm: '' // Término de búsqueda vacío
    });
});



// POST de bsucar pacientes
router.post('/buscadorPaciente', estaLogueado, soloTrabajadores, async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm.trim();
        let pacientesFiltrados = [];

        if (searchTerm) {
            pacientesFiltrados = await Paciente.find({
                $or: [
                    { nombre: { $regex: searchTerm, $options: 'i' } },
                    { apellido: { $regex: searchTerm, $options: 'i' } },
                    { documento: searchTerm }
                ]
            }).limit(50);
        } else {
            pacientesFiltrados = await Paciente.find().limit(50).sort({ apellido: 1 });
        }

        res.json({ pacientes: pacientesFiltrados });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

/* -------------------------------------------------------------------------- */
/*                         Pedir Cita desde trabajador                        */
/* -------------------------------------------------------------------------- */
// Ruta para ir al ejs de pedir cita desde trabajador
router.post('/pedirCita', estaLogueado, soloTrabajadores, async (req, res) => {

    const id = req.body.id_paciente;

    //función que devuelve los datos del paciente selecionado para crear la cita
    const paciente = await obtenerPacienteId(id);

    //console.log("Se han rescatado los sigueintes datos" + paciente);


    res.render('trabajadores/pedirCita', {
        title: 'Didadent',
        name: req.session.name,
        paciente: paciente[0] //información del paciente al que quiere crear la cita
    });
});

//Route para pedir cita desde el formulario
router.post('/pedirCitaGuardar', estaLogueado, soloTrabajadores, async (req, res) => {

    const id_paciente = req.body.id_paciente;
    const id_trabajador1 = req.session.usuarioId; //trabajador logueado
    const id_trabajador2 = req.body.id_trabajador2; //trabajador extra
    const fecha = req.body.fecha;
    const hora_inicio = req.body.hora_inicio;
    const hora_fin = req.body.hora_fin;
    const motivo = req.body.motivo;
    const estado = "Pendiente";

    console.log(id_paciente,fecha, hora_inicio, motivo,estado, hora_fin , id_trabajador1 ,id_trabajador2)

    //función que devuelve los datos del paciente selecionado para crear la cita
    const cita = await insertarCitaEnTrabajador(id_paciente,fecha, hora_inicio, motivo,estado, hora_fin);


    const insertTrabajador1 = await insertarCitaTrabajador(cita,id_trabajador1);

    if(id_trabajador2 != null){
        console.log("Si tiene trabajador 2");

        const insertTrabajador2 = await insertarCitaTrabajador(cita,id_trabajador2);
    }

    console.log("Se han realizado la cita" + cita);

    //devolver al buscador
    const pacientes = await buscarPacientes();

    res.render('trabajadores/buscadorPacientes', {
        title: 'Didadent',
        name: req.session.name,
        pacientes: pacientes, // cargar todos los pacientes
        searchTerm: '', // Término de búsqueda vacío
        mensajeExito: 'Se ha creado la cita con exito'
    });
});


//ruta para buscar los trabajadores que existe y se pueden agregar a la cita
router.get('/buscar-trabajadores', estaLogueado, soloTrabajadores, async (req, res) => {
    try {
        const todosTrabajadores = await obtenerTrabajadores();

        // quitar el trabajador que esta logueado de la lista, para que no aparezca en el desplegable
        const trabajadores = todosTrabajadores.filter(
            t => t.id_trabajador !== req.session.usuarioId 
        );

        res.json(trabajadores);
    } catch (error) {
        console.error("Error al obtener trabajadores:", error);
        res.status(500).json({
            error: "Error al cargar trabajadores",
            detalles: error.message
        });
    }
});



/* -------------------------------------------------------------------------- */
/*                              Datos Trabajador                              */
/* -------------------------------------------------------------------------- */

// GET datos trabajador
// Ruta para ver los datos del trabajador
router.get('/datos', estaLogueado, soloTrabajadores, async (req, res) => {

    let trabajador = (await obtenerTrabajadorId(req.session.usuarioId))[0]; //para acceder al primer objetoq eu es nuestro trabajador
    //console.log('Trabajador recuperado:', JSON.stringify(trabajador, null, 2));

    res.render('trabajadores/datosTrabajador', {
        title: 'Didadent',
        name: req.session.name,
        trabajador: trabajador
    });
});
// POST datos trabajador
router.post('/datos', async (req, res) => {

    const id = req.session.usuarioId;
    const rol = req.body.rol;
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const correo = req.body.correo;
    const tlf = req.body.tlf;
    const estado = req.body.estado;
    const especialidad = req.body.especialidad;
    const contraseña = req.body.contraseña;

    //console.log({ id, rol, nombre, apellidos, correo, tlf, estado, especialidad });

    const guadarDatos = guardarDatosTrabajador(id, rol, nombre, apellidos, correo, tlf, estado, especialidad);
    //console.log('datos guardados recuperado:', JSON.stringify(guadarDatos, null, 2));

    //Una vez realizado voover a hacer la consulta para ver los datos
    let trabajador = (await obtenerTrabajadorId(id))[0]; //para acceder al primer objeto que es nuestro trabajador
    //console.log('Trabajador recuperado:', JSON.stringify(trabajador, null, 2));

    res.render('trabajadores/datosTrabajador', {
        title: 'Didadent',
        name: req.session.name,
        trabajador: trabajador,
        mensajeExito: 'Datos actualizados correctamente.'
    })
});

// POST cambiar contarseña
router.post('/contrasena', async (req, res) => {
    const id = req.session.usuarioId;
    const nuevaContraseña = req.body.contraseña;
    const confirmarContraseña = req.body.confrimarContraseña; // ojo: typo en "confrimarContraseña"

    let trabajador = (await obtenerTrabajadorId(id))[0];


    if (nuevaContraseña !== confirmarContraseña) {
        return res.render('trabajadores/datosTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            trabajador,
            mensajeError: 'Las contraseñas no coinciden.' //mensaje de confirmación
        });
    }

    try {

        //llamamos a la función para guaradar las contarseñas
        const guardarContraseña = guardarContraseñaTrabajador(id, nuevaContraseña);

        res.render('trabajadores/datosTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            trabajador,
            mensajeExito: 'Contraseña actualizada correctamente.'
        });

    } catch (error) {
        console.error("❌ Error al cambiar contraseña:", error.message);
        res.render('trabajadores/datosTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            trabajador,
            mensajeError: 'Ha ocurrido un error al actualizar la contraseña.'
        });
    }
});


/* -------------------------------------------------------------------------- */
/*                        Configuracion del trabajador                        */
/* -------------------------------------------------------------------------- */

// GET configuracion
// Ruta para la configuracion personal
router.get('/configuracion', estaLogueado, soloTrabajadores, (req, res) => {
    res.render('trabajadores/configuracionTrabajador', {
        title: 'Didadent',
        login: true,
        name: req.session.name,
        rol: req.session.rol
    });
});

/* ------------------------ Vacaciones del trabajador ----------------------- */

// POST agregar vacaciones
router.post('/vacaciones', async (req, res) => {
    const id = req.session.usuarioId;
    const dia = req.body.dia;
    //console.log("dia:" + dia);

    // Convertimos el string a Date para comparar
    const hoy = new Date();
    const diaSolicitado = new Date(dia);

    // Poner misma hora para evitar errores
    hoy.setHours(0, 0, 0, 0);
    diaSolicitado.setHours(0, 0, 0, 0);

    // comprobamos que la fecha solicitada no es anterior al día de hoy
    if (diaSolicitado < hoy) {
        return res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeError: 'No puedes solicitar un día anterior al actual.'
        });
    }

    try {

        //llamar a funcíon de insert
        let diaVacaciones = await solicitarVacaciones(id, dia);

        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeExito: 'Se ha solicitado con éxito.'
        });

    } catch (error) {
        console.error("❌ Error al solicitar día de vacaciones:", error.message);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeError: 'No se ha podido solicitar.'
        });
    }
});


// GET vacaciones del trabajador
router.get('/vacaciones/obtenerVacaciones', async (req, res) => {
    const id = req.session.usuarioId;

    try {
        const vacaciones = await obtenerVacacionesId(id); // devuelve [{id: 5, dia: '2025-06-01'}, ...]
        res.json(vacaciones);
    } catch (error) {
        console.error("❌ Error al obtener vacaciones:", error.message);
        res.status(500).json({ error: "Error al obtener las vacaciones" });
    }
});

//Eliminar vacaciones
router.post('/vacaciones/eliminar', async (req, res) => {
    const { idVacacion } = req.body;

    try {
        await eliminarVacacion(idVacacion);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeExito: 'se ha eliminado el día selecionado de tus vacaciones.'
        });
    } catch (error) {
        console.error("❌ Error al eliminar vacaciones:", error.message);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeError: 'No se pudo eliminar el día de vacaiones.'
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                      horarios de turnos del trabajador                     */
/* -------------------------------------------------------------------------- */

//insertqr horario de trabajo nuevo
router.post('/insertar-horario-trabajo', async (req, res) => {
    const id = req.session.usuarioId;
    const dia = req.body.dia;
    const hora_inicio = req.body.hora_inicio;
    const hora_fin = req.body.hora_fin;

    try {

        console.log(id + dia + hora_inicio + hora_fin)
        //llamar a funcíon de insert
        let insertarDiaHora = await insertarHorarioTrabajador(id, dia, hora_inicio, hora_fin);

        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeExito: 'Se ha insertado el nuevo horario.'
        });

    } catch (error) {
        console.error("❌ Error al insertar el nuevo horario:", error.message);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeError: 'No se ha podido insertar.'
        });
    }

});

//? Obtener los datos del horario del trabajador
router.get('/obtener-horario-trabajo', async (req, res) => {

    const id = req.session.usuarioId;

    let horarios = await obtenerHorarioTrabajador(id);
    //console.log(horarios);
    res.json(horarios);

});
//actualizar horario del trabajador
router.post('/actualizar-horario-trabajo', async (req, res) => {
    const id_horarios = req.body.id_horarios;
    const dia = req.body.dia;
    const hora_inicio = req.body.hora_inicio;
    const hora_fin = req.body.hora_fin;

    console.log(id_horarios + dia + hora_inicio + hora_fin)

    let horarios = await obtenerHorarioTrabajador(id_horarios, dia, hora_inicio, hora_fin);

    try {
        if (Array.isArray(id_horarios)) {
            for (let i = 0; i < id_horarios.length; i++) {
                const id = id_horarios[i];
                const nuevoDia = dia[i];
                const nuevaHoraInicio = hora_inicio[i];
                const nuevaHoraFin = hora_fin[i];

                // función de actualizar loa datos
                await actualizarHorario(nuevaHoraInicio, nuevaHoraFin, id);
            }
        } else {
            // en caso de ser solo un horario y no un array pasar directamnete
            await actualizarHorario(hora_inicio, hora_fin, id_horarios);
        }

        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeExito: 'Se ha insertado el nuevo horario.'

        });
    } catch (error) {
        console.error('Error al actualizar horarios:', error);
        res.status(500).send('Error actualizando horarios');
    }
});

router.post('/eliminar-horario-trabajo', async (req, res) => {
    const id_horarios = req.body.id_horarios;

    try {
        await eliminarHorario(id_horarios);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeExito: 'se ha eliminado con éxito'
        });
    } catch (error) {
        console.error("❌ Error al eliminar vacaciones:", error.message);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeError: 'No se pudo eliminar el tuno del horario.'
        });
    }
});

/* ----------- Festivos de la clinica acceso solo administradores ----------- */
// POST agregar festivos
router.post('/festivos', accesoAdmin, async (req, res) => {
    const id = req.session.usuarioId;
    const dia = req.body.dia;
    const descripcion = req.body.descripcion;
    //console.log("dia:" + dia);


    try {

        //llamar a funcíon de insert
        let diaFestivos = await solicitarFestivos(id, dia, descripcion);

        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeExito: 'Se ha solicitado el festivo con éxito.'
        });

    } catch (error) {
        console.error("❌ Error al solicitar día festivo:", error.message);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeError: 'No se ha podido solicitar.'
        });
    }
});


// GET festivos de la clinica
router.get('/festivos/obtenerFestivos', async (req, res) => {

    try {
        const festivos = await obtenerFestivos();
        res.json(festivos);
    } catch (error) {
        console.error("❌ Error al obtener festivos:", error.message);
        res.status(500).json({ error: "Error al obtener los festivos" });
    }
});

//Eliminar vacaciones
router.post('/festivos/eliminar', accesoAdmin, async (req, res) => {
    const { idFestivos } = req.body;

    try {
        await eliminarFestivos(idFestivos);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeExito: 'se ha eliminado el día selecionado de los festivos.'
        });
    } catch (error) {
        console.error("❌ Error al eliminar festivo:", error.message);
        res.render('trabajadores/configuracionTrabajador', {
            title: 'Didadent',
            name: req.session.name,
            rol: req.session.rol,
            mensajeError: 'No se pudo eliminar el festivo.'
        });
    }
});


module.exports = router;