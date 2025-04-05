// models/trabajador.js
const conectarDB = require("../conexion/conexion");  // Conexión a la base de datos
const bcrypt = require("bcryptjs");  // Para encriptar la contraseña

// Función para registrar un nuevo trabajador
const registrarTrabajador = async (rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña) => {
    try {
        const connection = await conectarDB();

        // Verificar si el correo ya está registrado
        const [rows] = await connection.execute(
            "SELECT * FROM trabajador WHERE correo = ?",
            [correo]
        );

        if (rows.length > 0) {
            return { error: "⚠️ El correo ya está en uso" };  // Si el correo ya existe
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar el nuevo trabajador en la base de datos
        await connection.execute(
            "INSERT INTO trabajador (rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [rol, nombre, apellidos, correo, tlf, estado, especialidad, hashedPassword]
        );

        // Obtener los datos del nuevo trabajador
        const [newUser] = await connection.execute(
            "SELECT * FROM trabajador WHERE correo = ?",
            [correo]
        );

        await connection.end();  // Cerrar la conexión

        return { user: newUser[0] };  // Retornar el nuevo trabajador registrado
    } catch (error) {
        console.error("❌ Error al registrar trabajador:", error);
        return { error: "Error al registrar trabajador" };  // Error en caso de fallo
    }
};

module.exports = { registrarTrabajador };
