//Configuracion de conexion de la BD
const mariadb = require("mariadb")

const pool = mariadb.createPool({
    host: '127.0.0.1',
    port: '3307',
    user: 'root',
    password: 'madridbd',
    database: 'metrobus_cdmx',
    connectionLimit: 100,
});


async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.log("Esto es desde database.js " + error);
    }
}

module.exports = {getConnection}
