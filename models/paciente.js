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
        let consulta = "SELECT * FROM trabajador WHERE especialidad LIKE ?";
        let parametros = [`%${trabajador1}%`];
        // en caso de haber trabajador 2 tambien s eincorpora a la consulta
        if (trabajador2) {
            consulta += " OR especialidad LIKE ?";
            parametros.push(`%${trabajador2}%`);
        }

        const [rows] = await connection.execute(consulta, parametros);
        console.log("En obtener tarabajador encuentro a " + rows);
        return rows;
    } catch (error) {
        console.error("❌ Error al obtener los tarbajadores:", error.message);
        throw error;
    }
}

//todo saca los días disponibles y horas donde ese tipoo de cita con esa duración pueden darse
const obtenerDisponibilidadDelTrabajador = async (idTrabajador, duracionMinutos) => {
    const connection = await conectarDB();

    // 1. Obtener horario laboral
const [horariosRows] = await connection.execute(
    "SELECT dia, hora_inicio, hora_fin FROM horarios WHERE id_trabajador = ?",
    [idTrabajador]
);
    if (horariosRows.length === 0) throw new Error("Trabajador no encontrado");

    console.log('Horarios del trabajador:', horariosRows);

    const { hora_inicio_jornada, hora_fin_jornada } = horariosRows[0];

    //variable donde guardar los reusltado y en este formato
    const resultados = { fechas: [], horas: [] };

    const hoy = new Date(); //día presente
    let diasProcesados = 0;

    while (diasProcesados < 5) {
        hoy.setDate(hoy.getDate() + 1);
        const fechaStr = hoy.toISOString().split('T')[0];
        const diaSemana = hoy.getDay();

        if (diaSemana === 0 || diaSemana === 6) continue; // Saltar sábados y domingos

        // 2. Verificar si es festivo
        const [esFestivo] = await connection.execute(
            "SELECT * FROM festivos WHERE fecha = ?",
            [fechaStr]
        );
        if (esFestivo.length > 0) continue;

        // 3. Verificar si el trabajador está de vacaciones ese día
        const [estaDeVacaciones] = await connection.execute(
            `SELECT * FROM vacaciones WHERE id_trabajador = ? AND fecha = ?`,
            [idTrabajador, fechaStr]
        );
        if (estaDeVacaciones.length > 0) continue;

        // 4. Obtener citas existentes
        const [citas] = await connection.execute(
            `SELECT c.hora_inicio, c.hora_fin 
            FROM cita c
            JOIN cita_trabajador ct ON c.id_cita = ct.id_cita
            WHERE ct.id_trabajador = ? AND c.fecha = ?`,
            [idTrabajador, fechaStr]
        );

        console.log('Citas del trabajador:', citas);

        const bloquesLibres = generarBloquesDisponibles(hora_inicio_jornada, hora_fin_jornada, duracionMinutos, citas);

        if (bloquesLibres.length > 0) {
            resultados.fechas.push(fechaStr);
            resultados.horas.push(...bloquesLibres.map(hora => ({ fecha: fechaStr, hora })));
        }

        diasProcesados++;
    }

    return resultados;
};

// Función para generar bloques de tiempo disponibles
function generarBloquesDisponibles(horaInicio, horaFin, duracionMinutos, citasExistentes) {
    const bloques = [];
    let horaActual = new Date(`2025-01-01T${horaInicio}`); // Usamos una fecha arbitraria para manipular solo la hora.
    const horaFinal = new Date(`2025-01-01T${horaFin}`);

    // Mientras no llegue a la hora de fin
    while (horaActual < horaFinal) {
        const horaFinalBloque = new Date(horaActual.getTime() + duracionMinutos * 60000); // Añadir la duración al bloque
        if (horaFinalBloque > horaFinal) break; // No permitir bloques que excedan el final del horario

        // Convertir las horas a formato HH:mm para que sea más fácil compararlo con las citas
        const horaInicioStr = horaActual.toTimeString().slice(0, 5);
        const horaFinStr = horaFinalBloque.toTimeString().slice(0, 5);

        // Comprobar si la hora está ocupada por una cita
        const citaOcupada = citasExistentes.some(cita => {
            const horaCitaInicio = cita.hora_inicio.slice(0, 5);
            const horaCitaFin = cita.hora_fin.slice(0, 5);
            return (horaCitaInicio < horaFinStr && horaCitaFin > horaInicioStr); // Superposición
        });

        if (!citaOcupada) {
            bloques.push({ hora: horaInicioStr });
        }

        // Mover la hora al siguiente bloque
        horaActual = horaFinalBloque;
    }

    return bloques;
}







module.exports = { 
    registrarPaciente, loginPaciente,
    obtenerPacienteId , obtenerTrabajadoresParaCita,
    obtenerDisponibilidadDelTrabajador

};