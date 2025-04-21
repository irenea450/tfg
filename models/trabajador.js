const conectarDB = require('../conexion/conexion'); // Importar la conexión
const bcrypt = require("bcryptjs"); // Para encriptar y comparar contraseñas


async function obtenerTrabajadores() {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD
        const [rows] = await connection.execute("SELECT * FROM trabajador"); // Ejecutar consulta
        await connection.end(); // Cerrar la conexión
        return rows; // Retornar los resultados
    } catch (error) {
        console.error("❌ Error al obtener trabajadores:", error.message);
        throw error;
    }
}

const registrarTrabajador = async (rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña) => {
    try {
        const connection = await conectarDB();

        // Verificar si el correo ya está registrado
        const [rows] = await connection.execute(
            "SELECT * FROM trabajador WHERE correo = ?",
            [correo]
        );

        // Si el correo ya existe, devolver un error
        if (rows.length > 0) {
            return { error: "El correo introducido ya está en uso" };  // El correo ya existe
        }

        // Encriptar la contraseña antes de guardarla
        const contraseñaHaash = await bcrypt.hash(contraseña, 8);

        //console.log("Esta en models/trabajador.js en la funcion de registrar")

        const query = "INSERT INTO trabajador (rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await connection.execute(query, [rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseñaHaash]);


        return result;  // Devolver el resultado de la inserción si todo fue bien

    } catch (error) {
        console.error("❌ Error al insertar trabajador:", error.message);
        throw error;
    }
}



const loginTrabajador = async (correo, contraseña) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD

        console.log("comprobando en login trabajador");

        //? comporbar si existe el usuario y contraseña introducidos son correctos
        const [results] = await connection.execute("SELECT * FROM trabajador WHERE correo = ?", [correo]);

        //comprobar si existe el usuario con el correo introducido
        if (results.length == 0) {
            console.log("usuario trabajador con correo: " + correo + " incorrecto ❌");
            return { error: "El correo introducido no esta registrado" };
        }

        const usuario = results[0];

        // Compara la contraseña introducida con la guardada (ya encriptada)
        const compararContarseña = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!compararContarseña) {
            console.log("Contraseña incorrecta ❌");
            return { error: " contraseña incorrecta, vuelve a intentarlo" };
        }
        console.log(usuario);
        // Todo correcto
        return usuario;


    } catch (error) {
        console.error("❌ Error al obtener el usuario de trabajador:", error.message);
        throw error;
    }
}

/* --------------------------- horarios trabajador -------------------------- */
const horarioTrabajador = async (id) => {

    try {
        const connection = await conectarDB(); // Conectar a la BBDD

        console.log("estoy en horarioTrabajador: " + id);

        //? sacar el horario de ese trabajador
        const [rows] = await connection.execute("SELECT * FROM horarios WHERE id_trabajador = ?", [id]);

        //console.log("Usuario con horario:", rows);

        return rows;


    } catch (error) {
        console.error("❌ Error al obtener el horario del trabajador:", error.message);
        throw error;
    }
}

//todo función para saber si ese día es festivo
// Función para verificar si el día es festivo
const festivosTrabajador = async (diasLaborablesSemanaActual) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD

        console.log("Estoy en festivosTrabajador");

        // Crear un string de placeholders ?,?,?,...? dependiendo del número de fechas
        const placeholders = Array(diasLaborablesSemanaActual.length).fill('?').join(',');

        // Aquí pasamos las fechas en formato YYYY-MM-DD
        const query = `SELECT * FROM festivos WHERE fecha IN (${placeholders})`;

        // Asegurarnos de que las fechas estén en formato YYYY-MM-DD
        const diasLaborablesFormateados = diasLaborablesSemanaActual.map(fecha => {
            const [day, month, year] = fecha.split('/');
            return `${year}-${month}-${day}`; // Convertimos a YYYY-MM-DD
        });

        // Ejecutar la consulta con las fechas formateadas
        const [rows] = await connection.execute(query, diasLaborablesFormateados);

        // Aquí devolvemos las fechas como 'DD/MM/YYYY' para mostrar en el frontend
        const festivosFiltrados = rows.map(f => {
            const localDate = new Date(f.fecha);
            return localDate.toLocaleDateString('es-ES'); // Formato DD/MM/YYYY
        });

        return festivosFiltrados;

    } catch (error) {
        console.error("❌ Error al obtener el horario del trabajador:", error.message);
        throw error;
    }
}


//todo función para saber si ese día de vacaciones
const vacacionesTrabajador = async (diasLaborablesSemanaActual) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD

        console.log("Buscando las vacaciones del trabajador");

        // Crear un string de placeholders ?,?,?,...? dependiendo del número de fechas
        const placeholders = Array(diasLaborablesSemanaActual.length).fill('?').join(',');

        // Aquí pasamos las fechas en formato YYYY-MM-DD
        const query = `SELECT * FROM vacaciones WHERE fecha IN (${placeholders})`;

        // Asegurarnos de que las fechas estén en formato YYYY-MM-DD
        const diasLaborablesFormateados = diasLaborablesSemanaActual.map(fecha => {
            const [day, month, year] = fecha.split('/');
            return `${year}-${month}-${day}`; // Convertimos a YYYY-MM-DD
        });

        // Ejecutar la consulta con las fechas formateadas
        const [rows] = await connection.execute(query, diasLaborablesFormateados);

        // Aquí devolvemos las fechas como 'DD/MM/YYYY' para mostrar en el frontend
        const vacacionesFiltrados = rows.map(f => {
            const localDate = new Date(f.fecha);
            return localDate.toLocaleDateString('es-ES'); // Formato DD/MM/YYYY
        });

        return vacacionesFiltrados;

    } catch (error) {
        console.error("❌ Error al obtener las vacaciones del trabajador:", error.message);
        throw error;
    }
}



//todo obtener los días de la semana actual, pues queremos ver el horario actual de la semana presente 
// Función para obtener los días laborables de la semana actual
function obtenerDiasLaborablesSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 (domingo) a 6 (sábado)
    const lunesOffset = diaSemana === 0 ? -6 : 1 - diaSemana;

    const diasLaborables = [];

    for (let i = 0; i < 5; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + lunesOffset + i);

        // Convertir la fecha a formato 'DD/MM/YYYY' usando la zona horaria local
        const fechaFormateada = fecha.toLocaleDateString('es-ES'); // Formato DD/MM/YYYY
        diasLaborables.push(fechaFormateada);
    }

    return diasLaborables;
}


//todo obtener citas donde participa el trabajador logueado
const citasTrabajador = async (id) => {
    try {
        const connection = await conectarDB();
        console.log("estoy en citasTrabajador: " + id);

        // obtenemos realcionadas con el trabaajdor logueado
        const [relaciones] = await connection.execute(
            "SELECT id_cita FROM cita_trabajador WHERE id_trabajador = ?", [id]);

        const idsCitas = relaciones.map(r => r.id_cita);

        if (idsCitas.length === 0) {
            console.log("No se encuntran citas relacionadas");
            return []; // No hay citas relacionadas
        }

        // Creamos los placeholders (?, ?, ...) dinámicamente
        const placeholders = idsCitas.map(() => '?').join(',');

        const [citas] = await connection.execute(
            `SELECT * FROM cita WHERE id_cita IN (${placeholders}) AND estado = 'Pendiente' OR estado = 'Completada'`,
            idsCitas
        );

        //console.log("Citas pendientes:", citas);
        return citas;

    } catch (error) {
        console.error("❌ Error al obtener las citas del trabajador:", error.message);
        throw error;
    }
};


const consultarCita = async (id) => {
    try {
        const connection = await conectarDB();
        console.log("estoy consultando una cita con id: " + id);


        //buscamos cita con el id
        const [cita] = await connection.execute(`SELECT * FROM cita WHERE id_cita = ? `, [id]);

        //console.log("Cita obtenida en la funcion:", cita);
        return cita;

    } catch (error) {
        console.error("❌ Error al obtener las citas del trabajador:", error.message);
        throw error;
    }
};

const obtenerPaciente = async (id) => {
    try {
        const connection = await conectarDB();
        console.log("estoy consultando un paciente con id: " + id);


        //buscamos cita con el id
        const [paciente] = await connection.execute(`SELECT * FROM paciente WHERE id_paciente = ? `, [id]);

        //console.log("paciente obtenido en la funcion:", paciente);
        return paciente;

    } catch (error) {
        console.error("❌ Error al obtener el paceinte:", error.message);
        throw error;
    }
};

//funciones de modificar las citas de los pacientes
const actualizarCita = async (id, fecha, motivo, hora_inicio, hora_fin) => {
    //conexión  a la bbdd
    const connection = await conectarDB();

    //modificamos en la base de datos
    const [update] = await connection.execute(`UPDATE cita SET fecha = ?, motivo = ?, hora_inicio = ?, hora_fin = ? WHERE id_cita = ?`, 
        [fecha,motivo,hora_inicio,hora_fin, id]);
    
    console.log("Se ha realizado la actualizacion" + update)

}

const anularCita = async (id) => {
    //conexión  a la bbdd
    const connection = await conectarDB();

    //modificamos en la base de datos
    const [anular] = await connection.execute(`UPDATE cita SET estado = 'Anulada' WHERE id_cita = ?`, 
        [id]);
    
    console.log("Se ha realizado la anulación" + anular)

}

const completarCita = async (id) => {
    //conexión  a la bbdd
    const connection = await conectarDB();

    //modificamos en la base de datos
    const [completada] = await connection.execute(`UPDATE cita SET estado = 'Completada' WHERE cita.id_cita = ?`,
        [id]
    );
    
    console.log("Se ha completado la cita" + completada)

}

//función para crear informes sobre la cita realizada
const crearInforme = async (idPaciente,idCita,descripcion,fecha) => {
    //conexión  a la bbdd
    const connection = await conectarDB();

    //consulta
    const [informe] = await connection.execute(`INSERT INTO informes (id_paciente,id_cita,descripcion,fecha) VALUES (?, ?, ?, ?)`,
        [idPaciente,idCita,descripcion,fecha]
    );
    
    console.log("Se ha generado el infroma:" + informe)

}





//* Exportar las funciones para usarlas en otros archivos
module.exports = { 
    registrarTrabajador, 
    loginTrabajador, 
    horarioTrabajador, 
    festivosTrabajador,
    vacacionesTrabajador,
    obtenerDiasLaborablesSemanaActual , 
    citasTrabajador, 
    consultarCita, 
    obtenerPaciente,
    actualizarCita,
    anularCita,
    completarCita,
    crearInforme
};
