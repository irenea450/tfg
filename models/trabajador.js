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
        /* const [rows] = await connection.execute(
            "SELECT * FROM trabajador WHERE correo = ?",
            [correo]
        ); */

        /* if (rows.length > 0) {
            return { error: "⚠️ El correo ya está en uso" };  // Si el correo ya existe
        } */

        // Encriptar la contraseña antes de guardarla
        const contraseñaHaash = await bcrypt.hash(contraseña, 8);

        console.log("he llegado hasta la funcion de registrar")

        const query = "INSERT INTO trabajador (rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await connection.execute(query, [rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseñaHaash], async(error, results)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Alta exitosa");
            }
        });
        /* await connection.end(); */
        return result;
    } catch (error) {
/*         console.error("❌ Error al insertar trabajador:", error.message);
 */        throw error;
    }
}

//* Exportar las funciones para usarlas en otros archivos
module.exports = { registrarTrabajador };
