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

        
        return  result;  // Devolver el resultado de la inserción si todo fue bien

    }catch (error) {
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

        // Todo correcto
        return usuario;


    } catch (error) {
        console.error("❌ Error al obtener el usuario de trabajador:", error.message);
        throw error;
    }
}




//* Exportar las funciones para usarlas en otros archivos
module.exports = { registrarTrabajador, loginTrabajador };
