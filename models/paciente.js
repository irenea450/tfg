const conectarDB = require('../conexion/conexion'); // Importar la conexión
const bcrypt = require("bcryptjs"); // Para encriptar y comparar contraseñas

const registrarPaciente = async (rol,id, nombre, apellidos, correo, tlf, domicilio, fecha_nacimiento, sexo, contraseña) => {
    try {
        const connection = await conectarDB();

        console.log("Estoy registrando al paciente con usuario " + correo)

        // Verificar si el correo ya está registrado
        const [rows] = await connection.execute(
            "SELECT * FROM paciente WHERE correo = ?",
            [correo]
        );

        // Si el correo ya existe, devolver un error
        if (rows.length > 0) {
            return { error: "El correo introducido ya está en uso" };  // El correo ya existe
        }

        // Encriptar la contraseña antes de guardarla
        const contraseñaHaash = await bcrypt.hash(contraseña, 8);


        const query = "INSERT INTO paciente (rol, id_paciente, nombre, apellidos, correo, tlf, domicilio, fecha_nacimiento, sexo, contraseña) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await connection.execute(query, [rol, id , nombre, apellidos, correo, tlf, domicilio, fecha_nacimiento, sexo, contraseñaHaash]);

        
        return  result;  // Devolver el resultado de la inserción si todo fue bien

    }catch (error) {
        console.error("❌ Error al insertar trabajador:", error.message);
        throw error;
    }
}

//login paciente
const loginPaciente = async (correo, contraseña) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD

        console.log("comprobando en login paciente");

        //? comporbar si existe el usuario y contraseña introducidos son correctos
        const [results] = await connection.execute("SELECT * FROM paciente WHERE correo = ?", [correo]);

        //comprobar si existe el usuario con el correo introducido
        if (results.length == 0) {
            console.log("usuario con correo: " + correo + " incorrecto ❌");
            return { error: "El correo introducido no esta registrado" };
        }

        const usuario = results[0];

        // Compara la contraseña introducida con la guardada (ya encriptada)
        const compararContarseña = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!compararContarseña) {
            console.log("Contraseña incorrecta ❌");
            return { error: " contraseña incorrecta, vuelve a intentarlo" }; 
        }

        // Todo correcto
        return usuario;


    } catch (error) {
        console.error("❌ Error al obtener el usuario de trabajador:", error.message);
        throw error;
    }
}

//todo obtener paciente por el id
const obtenerPacienteId = async (id) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD
        const [rows] = await connection.execute("SELECT * FROM paciente WHERE id_paciente = ?" , [id]); // consulta el paciente que se pasa el id

        return rows; 
    } catch (error) {
        console.error("❌ Error al obtener al paciente:", error.message);
        throw error;
    }
}

//todo obtener el medico que necesito para mi cita
const obtenerTrabajadoresParaCita = async (trabajador1 , trabajador2=null) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD

        //hacemos la consulta y añadimos el parametro
        let consulta = "SELECT * FROM trabajador WHERE (especialidad LIKE ?"; 
        let parametros = [`%${trabajador1}%`];

        if (trabajador2) {
            consulta += " OR especialidad LIKE ?";
            parametros.push(`%${trabajador2}%`);
        }

        consulta += ") AND estado = 'activo'"; // solo los activos

        const [rows] = await connection.execute(consulta, parametros);
        console.log("En obtener tarabajador encuentro a " + rows);
        return rows;
    } catch (error) {
        console.error("❌ Error al obtener los tarbajadores:", error.message);
        throw error;
    }
}

//todo saca los días disponibles y horas donde ese tipoo de cita con esa duración pueden darse
    // Modifica la función obtenerDisponibilidadDelTrabajador
const obtenerDisponibilidadDelTrabajador = async (idTrabajador, duracionMinutos) => {
    const connection = await conectarDB();
    const resultados = { fechas: [] }; // Cambiamos la estructura

    // 1. Obtener horarios del trabajador
    const [horariosRows] = await connection.execute(
        "SELECT dia, hora_inicio, hora_fin FROM horarios WHERE id_trabajador = ?",
        [idTrabajador]
    );

    if (horariosRows.length === 0) throw new Error("Trabajador no tiene horarios definidos");

    const diasSemanaTexto = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hoy = new Date();
    let diasProcesados = 0;

    while (diasProcesados < 14) { // Buscamos en 14 días hacia adelante
        hoy.setDate(hoy.getDate() + 1);
        const fechaStr = hoy.toISOString().split('T')[0];
        const diaSemana = hoy.getDay();
        const nombreDiaSemana = diasSemanaTexto[diaSemana];

        if (diaSemana === 0 || diaSemana === 6) continue; // Saltar fines de semana

        const horarioDelDia = horariosRows.find(h => h.dia === nombreDiaSemana);
        if (!horarioDelDia) continue;

        // Verificar festivo y vacaciones
        const [esFestivo] = await connection.execute("SELECT * FROM festivos WHERE fecha = ?", [fechaStr]);
        const [estaDeVacaciones] = await connection.execute(
            `SELECT * FROM vacaciones WHERE id_trabajador = ? AND fecha = ?`,
            [idTrabajador, fechaStr]
        );

        if (esFestivo.length > 0 || estaDeVacaciones.length > 0) continue;

        resultados.fechas.push({
            fecha: fechaStr,
            dia: nombreDiaSemana,
            hora_inicio: horarioDelDia.hora_inicio,
            hora_fin: horarioDelDia.hora_fin
        });
        diasProcesados++;
    }

    return resultados;
};

// Nueva función para obtener horas de un día específico
async function obtenerHorasDisponibles(idTrabajador, fecha, duracionMinutos) {
    const connection = await conectarDB();
    
    try {
        // 1. Obtener el día de la semana (0=Domingo, 1=Lunes, etc.)
        const fechaObj = new Date(fecha);
        const diaSemana = fechaObj.getDay();
        const diasSemanaTexto = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const nombreDiaSemana = diasSemanaTexto[diaSemana];
        
        // 2. Obtener horario para ese día
        const [horario] = await connection.execute(
            "SELECT hora_inicio, hora_fin FROM horarios WHERE id_trabajador = ? AND dia = ?",
            [idTrabajador, nombreDiaSemana]
        );
        
        if (horario.length === 0) {
            throw new Error("No hay horario definido para este día");
        }
        
        // 3. Obtener citas existentes
        const [citas] = await connection.execute(
            `SELECT c.hora_inicio, c.hora_fin 
             FROM cita c
             JOIN cita_trabajador ct ON c.id_cita = ct.id_cita
             WHERE ct.id_trabajador = ? AND c.fecha = ?`,
            [idTrabajador, fecha]
        );
        
        console.log('Citas existentes:', citas);
        
        // 4. Generar bloques disponibles

        const horasDeDescanso = generarHorasDescanso('14:30', '16:00', 1);
        // Resultado: ['14:30:00', '14:50:00', '15:10:00', '15:30:00', '15:50:00']

        const bloques = generarBloquesDisponibles(
            horario[0].hora_inicio,
            horario[0].hora_fin,
            duracionMinutos,
            citas,
            horasDeDescanso
        );
        
        return bloques;
    } finally {
        if (connection) await connection.end();
    }
}

// Añade esto en tu archivo paciente.js, preferiblemente al principio o con las otras funciones
function generarBloquesDisponibles(horaInicio, horaFin, duracionMinutos, citasExistentes, horasDeDescanso) {
    const bloques = [];
    const duracionMs = duracionMinutos * 60000;
    const fechaBase = '1970-01-01'; // Fecha base para comparaciones
    
    let horaActual = new Date(`${fechaBase}T${horaInicio}`);
    const horaFinalObj = new Date(`${fechaBase}T${horaFin}`);
    
    // Convertir horas de descanso a objetos Date
    const descansos = horasDeDescanso.map(h => new Date(`${fechaBase}T${h}`));
    
    while (horaActual < horaFinalObj) {
        const horaFinalBloque = new Date(horaActual.getTime() + duracionMs);
        
        // No sobrepasar el horario de fin
        if (horaFinalBloque > horaFinalObj) break;
        
        const horaInicioStr = horaActual.toTimeString().substring(0, 5);
        const horaFinStr = horaFinalBloque.toTimeString().substring(0, 5);
        
        // Verificar si está en horas de descanso
        const enDescanso = descansos.some(descanso => {
            return horaActual.getHours() === descanso.getHours() && 
                   horaActual.getMinutes() === descanso.getMinutes();
        });
        
        if (enDescanso) {
            horaActual = horaFinalBloque;
            continue;
        }
        
        // Verificar colisión con citas existentes
        const citaOcupada = citasExistentes.some(cita => {
            const citaInicio = new Date(`${fechaBase}T${cita.hora_inicio}`);
            const citaFin = new Date(`${fechaBase}T${cita.hora_fin}`);
            
            return (
                (horaActual >= citaInicio && horaActual < citaFin) ||
                (horaFinalBloque > citaInicio && horaFinalBloque <= citaFin) ||
                (horaActual <= citaInicio && horaFinalBloque >= citaFin)
            );
        });
        
        if (!citaOcupada) {
            bloques.push({ hora: horaInicioStr });
        }
        
        horaActual = horaFinalBloque;
    }
    
    return bloques;
}

function generarHorasDescanso(inicio, fin, duracionCita) {
    const horasDescanso = [];
    let [horaActual, minutoActual] = inicio.split(':').map(Number);
    const [horaFin, minutoFin] = fin.split(':').map(Number);
    
    while (horaActual < horaFin || (horaActual === horaFin && minutoActual < minutoFin)) {
        horasDescanso.push(
            `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}:00`
        );
        
        minutoActual += duracionCita;
        if (minutoActual >= 60) {
            minutoActual -= 60;
            horaActual++;
        }
    }
    
    return horasDescanso;
}

/* ----------------------------- insertar citas ----------------------------- */
//todo función donde se inserta la cita del paciente
const insertarCitaPaciente = async (id_paciente, fecha_cita, hora_cita, duracion, motivoSelect) => {
    try {

        const estado = 'Pendiente'; //establezco el estado predeterminado de las citas

        const connection = await conectarDB(); // Conectar a la BBDD
        const [rows] = await connection.execute("INSERT INTO cita ( id_paciente, fecha, hora_inicio, motivo, estado, hora_fin)  VALUES (?, ?, ?, ?, ?, ?)" ,
            [                
                id_paciente,
                fecha_cita,
                hora_cita, //hora de inicio
                motivoSelect,
                estado,
                calcularHoraFinCita(hora_cita, duracion)
            ]);

            // guardamos el id de la cita qeu acabamos de introducir
            const idCita = rows.insertId;

            //console.log(idCita);
            //console.log(calcularHoraFinCita(hora_cita, duracion));

        return idCita; //devulve el id de la cita, para ahroa insertar en cita_trabajador
    } catch (error) {
        console.error("❌ Error al insertar cita:", error.message);
        throw error;
    }
}

// Función  para calcular hora_fin según la duración de la cita
function calcularHoraFinCita(horaInicio, duracionMinutos) {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas, minutos + duracionMinutos, 0, 0);
    return fecha.toTimeString().substring(0, 5);
}

//todo función donde se inserta en la tabla cita_trabajador
const insertarCitaTrabajador = async (cita, id_trabajador) => {
    try {

        const connection = await conectarDB(); // Conectar a la BBDD
        const [rows] = await connection.execute("INSERT INTO cita_trabajador ( id_cita, id_trabajador)  VALUES (?, ?)" ,
            [ cita , id_trabajador]);


        return rows;
    } catch (error) {
        console.error("❌ Error al insertar cita_trabajador:", error.message);
        throw error;
    }
}


/* -------------------------------------------------------------------------- */
/*                                  Informes                                  */
/* -------------------------------------------------------------------------- */
//? obtener todos los infromes del paciente que reciba
const obtenerInformes = async (id_paciente) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD
        
        const query = `
            SELECT 
                i.id_informes,
                i.descripcion,
                i.fecha,
                c.id_cita,
                c.hora_inicio,
                c.motivo,
                t.id_trabajador,
                CONCAT(t.nombre, ' ', t.apellidos) AS nombre_trabajador,
                t.especialidad
            FROM 
                informes i
            INNER JOIN 
                cita c ON i.id_cita = c.id_cita
            INNER JOIN 
                cita_trabajador ct ON c.id_cita = ct.id_cita
            INNER JOIN 
                trabajador t ON ct.id_trabajador = t.id_trabajador
            WHERE 
                i.id_paciente = ?
            ORDER BY 
                i.fecha DESC
        `;
        
        const [informes] = await connection.execute(query, [id_paciente]);
        return informes;
    } catch (error) {
        console.error("❌ Error al obtener los informes:", error.message);
        throw error;
    }
}

/* -------------------------------------------------------------------------- */
/*                               Datos Paciente                               */
/* -------------------------------------------------------------------------- */
//todo actualizar datos del paciente
const guardarDatosPaciente = async (id,rol,nombre,apellidos,correo,tlf,domicilio,fecha_nacimiento,sexo) => {
    try {
        const connection = await conectarDB();

        const query = 'UPDATE paciente SET rol = ?, nombre = ?, apellidos = ?, correo = ?, tlf = ?, domicilio = ?, fecha_nacimiento = ? , sexo = ? WHERE id_paciente = ?';
        const [row] = await connection.execute(query, [rol, nombre, apellidos, correo, tlf, domicilio, fecha_nacimiento,sexo, id]);


        return row;  // Devolver el resultado del update si todo esta bien

    } catch (error) {
        console.error("❌ Error al insertar paciente:", error.message);
        throw error;
    }
}

//todo función para guardar la nueva contraseña
const guardarContraseñaPaciente = async (id,nuevaContraseña) => {
    try {
        const connection = await conectarDB();

        const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);

        const query = 'UPDATE paciente SET contraseña = ? WHERE id_paciente = ?';
        const [row] = await connection.execute(query, [contraseñaHash, id]);

        return row;

    } catch (error) {
        console.error("❌ Error al cambiar la contarseña del paciente:", error.message);
        throw error;
    }
}

//todo eliminar la cuenta del paciente
const eliminarCuentaPaciente = async (id) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD
        await connection.beginTransaction(); //empezar transación

        //para eliminar el apciente hay qeu hacerlo de forma escalonada

        // 3. Eliminar los informes médico
        await connection.execute(
            "DELETE FROM informes WHERE id_paciente = ?", 
            [id]
        );

        // 1. Eliminar registros en cita_trabajador relacionados con las citas del paciente
        await connection.execute(`
            DELETE ct FROM cita_trabajador ct
            INNER JOIN cita c ON ct.id_cita = c.id_cita
            WHERE c.id_paciente = ?
        `, [id]);

        // 2. Eliminar las citas del paciente
        await connection.execute(
            "DELETE FROM cita WHERE id_paciente = ?", 
            [id]
        );

        // 3. Eliminar el historial médico
        await connection.execute(
            "DELETE FROM historial WHERE id_paciente = ?", 
            [id]
        );



        // 4. Finalmente eliminar al paciente
        const [result] = await connection.execute(
            "DELETE FROM paciente WHERE id_paciente = ?", 
            [id]
        );

        await connection.commit();
        return result;

    } catch (error) {
        console.error("❌ Error al eliminar la cuenta:", error.message);
        throw error;
    }
}

/* -------------------------------------------------------------------------- */
/*                             Historial Paciente                             */
/* -------------------------------------------------------------------------- */
const obtenerHistorialPacienteId = async (id) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD
        const [rows] = await connection.execute("SELECT * FROM historial WHERE id_paciente = ?" , [id]); // consulta el historial del apcaiente que se pasa el id

        return rows; 
    } catch (error) {
        console.error("❌ Error al obtener el historial del paciente:", error.message);
        throw error;
    }
}

//todo función donde se inserta el historial
const insertarHistorialPaciente = async (id,alergias,antecedentes, descripcion) => {
    try {

        const connection = await conectarDB(); // Conectar a la BBDD

        const fecha = new Date; //fecha en la que se realiza

        const [rows] = await connection.execute("INSERT INTO historial ( id_paciente, alergias, descripcion, antecedentes_familiares, fecha)  VALUES (?, ?, ? , ?, ?)" ,
            [ id, alergias, antecedentes, descripcion , fecha]);


        return rows;
    } catch (error) {
        console.error("❌ Error al insertar el historial:", error.message);
        throw error;
    }
}

//todo función donde se inserta el historial
const guardarHistorialPaciente = async (id,alergias,antecedentes, descripcion) => {
    try {

        const connection = await conectarDB(); // Conectar a la BBDD

        const fecha = new Date; //fecha actual con la ultima actualización

        const [rows] = await connection.execute("UPDATE historial SET alergias = ?, descripcion = ?, antecedentes_familiares = ?, fecha = ? WHERE id_paciente = ?" ,
            [ alergias, descripcion, antecedentes, fecha , id ]);


        return rows;
    } catch (error) {
        console.error("❌ Error al guardar los cambios del historial:", error.message);
        throw error;
    }
}

module.exports = { 
    registrarPaciente, loginPaciente,
    obtenerPacienteId , obtenerTrabajadoresParaCita,
    obtenerDisponibilidadDelTrabajador , obtenerHorasDisponibles , calcularHoraFinCita,
    insertarCitaPaciente , insertarCitaTrabajador,
    obtenerInformes,
    guardarContraseñaPaciente, guardarDatosPaciente, eliminarCuentaPaciente,
    obtenerHistorialPacienteId , insertarHistorialPaciente , guardarHistorialPaciente

};