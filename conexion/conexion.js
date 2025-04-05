//? Conexión a la base de datos de la clinica
const mysql = require('mysql2/promise');

async function conectarDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'clinica'
        });

        console.log("Conexión a la bbdd establecida con éxito")
        return connection;
    } catch (err) {
        console.log("Conexión fallida con la base de datos‼")
        throw err; // Propaga el error para manejarlo en otros archivos
    }
}
//* Exportar la conexión
module.exports = conectarDB;



//consulta a la base de datos
/* connection.query("SELECT * FROM `trabajador` ", function(err, resultados){
    console.log(resultados); //muestra los resultados
}); */


//^ Cierra conexión
//connection.end()