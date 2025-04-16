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

        console.log("Usuario con horario:", rows);

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











//* Exportar las funciones para usarlas en otros archivos
module.exports = { registrarTrabajador, loginTrabajador, horarioTrabajador, festivosTrabajador, obtenerDiasLaborablesSemanaActual };
