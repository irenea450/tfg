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


module.exports = { registrarPaciente, loginPaciente };