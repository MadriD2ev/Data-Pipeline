
const express = require("express");
const router = express();
const request = require("request");
const fetch = require("node-fetch");
const pool = require("../../database")

const port = 3000;
let datos;
let datosAlcaldias;
//insercionBD Me indicara si se pudo consumir la API y que tenga información
let insercionBD = 0;
let objAlcaldiaTotal = []; 
let objAlcaldia = {};
let coordAlcaldia;
let coordAlcaldiaD;
let latitudAlcaldia = [];
let latitudMetrobus = [];
let valorAproximado = [];
let ordenado;
let apiConsumida = 0;



//Consumir la api de CDMX - Metrobus
request('https://datos.cdmx.gob.mx/api/3/action/datastore_search?resource_id=ad360a0e-b42f-482c-af12-1fd72140032e&limit=207', {json:true},(err,res,body) => {
    
    if(err){

        insercionBD = 1
        console.log("Error al consumir la API del metrobùs " + err)

    }else{

        //convertir el objeto JSON en un array para poder iterarlo
        datos = body.result.records
        
        if(datos.length == 0) {
            insercionBD = 1  
        }
             
    }

})

//Consumir la api de CDMX - Alcaldias
request('https://datos.cdmx.gob.mx/api/3/action/datastore_search?resource_id=dbb00cee-3660-43f6-89c2-8beb433292a8&limit=16', {json:true},(err,res,body) => {
    
    if(err){
        insercionBD = 1
        console.log("Error al consumir la API de los lìmites de la alcaldìa " + err)
    }else{
        //convertir el objeto JSON en un array para poder iterarlo
        datosAlcaldias = body.result.records

        if(datosAlcaldias.length != 0) {
            //Obtener la latitudes de las alcaldías
            datosAlcaldias.map(x => {
                coordAlcaldia = (x.geo_point_2d).split(',')
                latitudAlcaldia.push(
                    parseFloat(coordAlcaldia[0])
                )  
            })
            //Ordenar las latitudes de manera ascendente
            ordenado = latitudAlcaldia.sort()
            
            //Obtener las alcaldías correspondientes del arreglo latitudAlcaldia
            ordenado.map(x => {
                datosAlcaldias.map(y => { 
                    coordAlcaldiaD = (y.geo_point_2d).split(',')
                    if(x == coordAlcaldiaD[0]){
                        objAlcaldiaTotal.push([ 
                            objAlcaldia["Latitud"]=parseFloat(parseFloat(coordAlcaldiaD[0]).toFixed(4)),
                            objAlcaldia["NombreAlcaldia"]= y.nomgeo
                        ]) 
                    }
                })
            })

            //Alcaldías disponibles
            //console.log(objAlcaldiaTotal)

            datosInsertar()

        }else{
            insercionBD = 1 
        } 
    }

})


//Uniremos los datos a insertar en la BD
const datosInsertar = () => {

    //Creo un arreglo que contiene solo la latitud de la alcaldía
    objAlcaldiaTotal.map(item => {
        latitudMetrobus.push(item[0])
    })

    //Busco la latitud de la alcaldía más próxima a la latitud del metrobus
    datos.map(item => {
        valorAproximado.push([
            latitudMetrobus.find(element => element > datos[item.id].position_latitude),
            datos[item.id].position_latitude,
        ])
        
    })

    /*
        Como existen algunas posiciones de autobús (respecto a la latitud) que no se
        aproximan a alguna de las alcaldías, dejé por default 19.4853 que corresponde 
        a "Azcapotzalco" en valorAproximado
    */
    const indice = valorAproximado.findIndex((elemento, indice) => {
        if (elemento[0] == undefined) {
          valorAproximado[indice][0]=19.4853
        }
    });
    

    //Agrego la alcaldía a valorAproximado
    valorAproximado.findIndex((elemento, indice) => {
        objAlcaldiaTotal.map(i => {
            if (elemento[0] == i[0]) {
                valorAproximado[indice][2]=i[1]
            }
        })
        
    })

    //Se agregan los datos faltantes para insertar a la BD
    valorAproximado.findIndex((elemento, indice) => {
        datos.map(i => {
            if (elemento[1] == i.position_latitude) {
                valorAproximado[indice][3]=i.vehicle_id
                valorAproximado[indice][4]=i.vehicle_label
                valorAproximado[indice][5]=i.trip_schedule_relationship
                valorAproximado[indice][6]=i.geographic_point
            }
        })
        
    })

}
    
//Función que inserta los registros en la BD
const insertarBD = async() => {

    //Esto obtiene la conexion
    const conn = await pool.getConnection();
    let query = [];

    try {

        valorAproximado.findIndex((elemento, indice) => {
            
            //Crea una nueva consulta
            query.push(
                "INSERT INTO PruebaDatosMetrobus(latitudAlcaldia, latitudMetrobus, nombreAlcaldia, vehicle_id, vehicle_label, trip_schedule_relationship, geographic_point)" +
                "VALUES " + 
                "(" + valorAproximado[indice][0]+ "," + 
                valorAproximado[indice][1]+ ",'" +
                valorAproximado[indice][2]+ "'," +
                valorAproximado[indice][3]+ "," + 
                valorAproximado[indice][4]+ "," + 
                valorAproximado[indice][5]+ ",'" +
                valorAproximado[indice][6]+ "');"
            )
        
        })

        query.forEach( async item => {
            //se insertan los datos en la BD
            let rows = await conn.query(item);
        })
        
    } catch (error) {
        console.log(error)
    }
    
}

//Raíz, después de consultar los registros en las API's esta ruta inserta información en la BD
router.get('/', (req, res) => {

    //Ejecutar función
    //insercionBD ? '' : insertarBD()
    if(!insercionBD && apiConsumida == 0) {
        apiConsumida = 1;
        insertarBD()
    }
    
    let consumidaAPI;
    
    if(insercionBD == 0){
        consumidaAPI = 0
    }else{
        consumidaAPI = 1
    }

    res.render('raiz', {titulo: consumidaAPI})
})

//Son las alcaldías disponibles
router.get('/alcaldias', async(req, res) => {
    try {
        //Esto obtiene la conexion
        const conn = await pool.getConnection();

        //Crea una nueva consulta
        const query = 'SELECT DISTINCT nombreAlcaldia FROM PruebaDatosMetrobus ORDER BY nombreAlcaldia'

        //Ejecutando el query
        const rows = await conn.query(query);

        //Respuesta
        res.render('alcaldias', {todasAlcaldias: rows})

    } catch (error) {
        console.log("Esto es un error en /alcaldias " + error);
    }
})

//Paginación de unidadesDisponibles
router.get('/unidades', async(req, res) => {
    try {

        //Esto obtiene la conexion
        const conn = await pool.getConnection();

        //Crea una nueva consulta
        const query = `
            SELECT 
                COUNT(DISTINCT vehicle_id)total
            FROM PruebaDatosMetrobus
            WHERE trip_schedule_relationship = 0
            ORDER BY vehicle_id
        `
        
        //Ejecutando el query
        const rows = await conn.query(query);
        const salida = rows[0].total

        //Respuesta
        res.render('unidades', {unidadesDisponibles: salida})

        
    } catch (error) {
        console.log("Esto es un error en /unidades paginación" + error);
    }
})

//Lista de unidades disponibles
router.get('/unidades/todos', async(req, res) => {
    try {

        //Esto obtiene la conexion
        const conn = await pool.getConnection();

        //Crea una nueva consulta
        const query = `
            SELECT 
                DISTINCT vehicle_id, vehicle_label 
            FROM PruebaDatosMetrobus
            WHERE trip_schedule_relationship = 0
            ORDER BY vehicle_id
        `
        
        //Ejecutando el query
        const rows = await conn.query(query);

        let arrayNuevo = [];
       
        //Crear un objeto
        for(let i=0; i < rows.length; i++) {
            arrayNuevo.push(
                {
                    idVehicle: rows[i].vehicle_id,
                    labelVehicle: rows[i].vehicle_label
                }
            )
        }
        res.json(arrayNuevo)

        
    } catch (error) {
        console.log("Esto es un error en /unidades " + error);
    }
})

//Paginación de unidadesAlcaldia
router.get('/unidadesAlcaldia', async(req, res) => {
    try {

        //Esto obtiene la conexion
        const conn = await pool.getConnection();

        //Crea una nueva consulta
        const query = `
            SELECT 
                COUNT(idRegistro)total
            FROM PruebaDatosMetrobus
        `
        
        //Ejecutando el query
        const rows = await conn.query(query);
        const salida = rows[0].total

        //Respuesta
        res.render('unidadesAlcaldia', {unidadesAlcaldia: salida })

        
    } catch (error) {
        console.log("Esto es un error en /unidadesAlcaldia paginación" + error);
    }
})

//Unidades que se encuentran dentro de una alcaldía
router.get('/unidadesAlcaldia/todos', async(req, res) => {

    try {

        //Esto obtiene la conexion
        const conn = await pool.getConnection();

        //Crea una nueva consulta
        const query = `
        SELECT 
            nombreAlcaldia, vehicle_id, vehicle_label
        FROM PruebaDatosMetrobus 
        ORDER BY nombreAlcaldia
        `
        
        //Ejecutando el query
        const rows = await conn.query(query);

        let arrayNuevo = [];
       
        //Crear un objeto
        for(let i=0; i < rows.length; i++) {
            arrayNuevo.push(
                {
                    nombreAlcaldia: rows[i].nombreAlcaldia,
                    idVehicle: rows[i].vehicle_id
                }
            )
        }
        res.json(arrayNuevo)
  
    } catch (error) {
        console.log("Esto es un error en /unidadesAlcaldia " + error);
    }
})

//Sección de la búsqueda de una unidad dado su ID
router.get('/buscarHistorial', (req, res) => {

    //Respuesta
    res.render('buscarHistorial', {buscarHistorial: "Búsqueda de unidades por alcaldía"})

})

//De acuerdo al Id proporcionado mostrar el historial
router.get('/historialUnidad/:id', async(req, res) => {

    const id = req.params.id

    //console.log("Estoy recibiendo el id para historialUnidad" + id)

    try {
        //Esto obtiene la conexion
        const conn = await pool.getConnection();

        //Crea una nueva consulta
        const query = `
            SELECT 
                DISTINCT vehicle_id, geographic_point, nombreAlcaldia
            FROM PruebaDatosMetrobus
            WHERE vehicle_id = ${id}
            ORDER BY vehicle_id
        `
        
        //Ejecutando el query
        const rows = await conn.query(query);
        let arrayNuevo = [];
       
        //Crear un objeto
        rows.findIndex((elemento, indice) => {
            arrayNuevo.push(
                {
                    idVehiculo: rows[indice].vehicle_id,
                    geographicPoint: rows[indice].geographic_point,
                    alcaldiaVehiculo: rows[indice].nombreAlcaldia
                }
            )
        })
        
      res.json(arrayNuevo)
       
    } catch (error) {
        console.log(error)
    }
    

})

module.exports = router



