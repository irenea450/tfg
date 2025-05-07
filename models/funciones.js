//Funciones comunes para pacientes y trabajadores
//impportaciones necesarias
const conectarDB = require('../conexion/conexion'); // Importar la conexión

//todo obtener las citas pendientes de x paciente
const citasPendientesId = async (id) => {
    try {
        const connection = await conectarDB(); // Conectar a la BBDD
        const [rows] = await connection.execute("SELECT * FROM cita WHERE id_paciente = ? AND estado = 'pendiente' ", [id]); // consulta citas pendientes del paciente

        return rows; 
    } catch (error) {
        console.error("❌ Error al obtener las citas del paciente:", error.message);
        throw error;
    }
}

//todo anular cita mediante idcita
const anularCita = async (id) => {
    //conexión  a la bbdd
    const connection = await conectarDB();

    //modificamos en la base de datos
    const [anular] = await connection.execute(`UPDATE cita SET estado = 'Anulada' WHERE id_cita = ?`, 
        [id]);
    
    console.log("Se ha realizado la anulación" + anular)

}

//todo horario del trabajador
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



//* Exportar las funciones para usarlas en otros archivos
module.exports = { 
    citasPendientesId,
    anularCita,
    insertarCitaTrabajador
};

