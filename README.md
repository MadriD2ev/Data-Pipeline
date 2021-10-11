# Data-Pipeline
Pipeline de análisis de datos utilizando los datos abiertos de la Ciudad de México correspondientes a la ubicación de las unidades del metrobús durante la última hora para obtener un histórico de la posición en la que se encuentra cada unidad que pueda ser consultado mediante un API Rest filtrando por unidad o por alcaldía.

![PruebaTecnica](https://user-images.githubusercontent.com/68882204/136842944-20bbfc45-5e3e-4656-b0ea-cdbb3107c62c.jpg)

## Desarrollo de Interfaz

Se implementa un motor de plantillas con Express, en este caso EJS, se instala mediante NPM ***npm install ejs*** así como un compilador de CSS y JS que nos proporciona Bootstrap.

## Creación de la Base de Datos

Ya instalado MySQL en nuestro equipo local tecleamos ***mysql --host 127.0.0.1 -P 3307 -u root -p*** 

Para ver las BD creadas

- SHOW DATABASES; 

Crear la base de datos

- CREATE DATABASE metrobus_cdmx;

Para posicionarnos en la BD a trabajar:

- USE metrobus_cdmx;

Crear la tabla correspondiente que se llenará a partir de la información obtenida de las API's Datos del metrobús y las demarcaciones territoriales de las Alcaldías.

```mysq
CREATE TABLE PruebaDatosMetrobus (
	latitudAlcaldia FLOAT NOT NULL, latitudMetrobus FLOAT NOT NULL, nombreAlcaldia  VARCHAR(50), 
	vehicle_id INT NOT NULL, vehicle_label INT NOT NULL, trip_schedule_relationship INT NOT NULL, 
	geographic_point VARCHAR(100), idRegistro BIGINT NOT NULL AUTO_INCREMENT,PRIMARY KEY (idRegistro)
);
```

## Desarrollo del Docker

### Implementación mediante Node, MariaDB y Docker Compose

##### Para Node

- [ ] Crear un archivo de node

  - npm init -y

    Permite crear el package .json que nos permite generar los modulos para nuestro proyecto y poder funcionar 

- [ ] Instalar express y mariadb

  - npm i express mariadb

    Express me permite crear mi servidor

    Mariadb es un driver de conexión para poder utilizar async, await sin necesidad de englobarlo en un paquete de promesa

    

##### Para el Docker

En la carpeta donde tenemos nuestro proyecto, en mi caso llamado servercdmx crear:

- [ ] Un archivo llamado *.dockerignore* en el que agregaremos /node_modules
- [ ] Otro archivo llamado *Dockerfile* donde se describe la versión del node a utilizar, se crea una copia de nuestro proyecto, el puerto expuesto y los comandos necesarios para que corra.



Tener instalado la extensión de docker en VSC

Con Docker Desktop levantar el servicio del contenedor 

Instalar la imagen de <u>mariadb/server</u> que se encuentra en la página de hub.docker

- En la terminal correr la siguiente instrucción ***docker run -p 3307:3306 -d --name mariadb -e MARIADB_ROOT_PASSWORD=madridbd mariadb/server:10.4***

  El puerto 3306 es para la BD dentro del contenedor y en nuestro equipo lo vamos a estar escuchando en el puerto 3307

  Este contenedor necesito estarlo ejecutando siempre así que se debe ejecutar en el modo ditash mediante un nombre (-d --name [nombreQueElijasSinCorchetes])

  Se requiere configurar el usuario(root) y contraseña de la BD, utilizamos una variable de entorno -e MARIADB_ROOT_PASSWORD=madridbd



- Para conectarse al contenedor tendríamos que ocupar una aplicación y para eso está Node (database.js). Sin emabargo para el proyecto necesito crear algunas tablas para consulta de información así que ocupare mi terminal y ejecutaré la siguiente línea ***mysql --host 127.0.0.1 -P 3307 -u root -p*** en la que se describe la dirección ip, el puerto, el usuario y la contraseña nos la pedirá.

## Componentes a Instalar en MAC 

- Mac with Intel Chip -> Docker.dmg
- En VSC instalar la extensión Remote - Containers v0.198.0 de Microsoft 
- MySQL -> macOS 11 (x86, 64-bit), DMG Archive -> brew install mysql

## Bibliografía

### Consulta

- [Datos Abiertos - Dependencias Metrobús](https://datos.cdmx.gob.mx/dataset/prueba_fetchdata_metrobus/resource/ad360a0e-b42f-482c-af12-1fd72140032e?inner_span=True)
- [Datos Abiertos del Metrobús](https://www.metrobus.cdmx.gob.mx/portal-ciudadano/datos-abiertos)
- [Demarcaciones territoriales de la Ciudad de México](https://es.wikipedia.org/wiki/Demarcaciones_territoriales_de_la_Ciudad_de_M%C3%A9xico)
- [Datos Abiertos de los límites de las alcaldías](https://datos.cdmx.gob.mx/dataset/limite-de-las-alcaldias/resource/dbb00cee-3660-43f6-89c2-8beb433292a8)
- [hub.docker](https://hub.docker.com/_/node)
- [docker.com](https://www.docker.com/products/docker-desktop)
- [VSC - Containers](https://code.visualstudio.com/docs/remote/containers-tutorial)
- [mariabd](https://hub.docker.com/r/mariadb/server)
- [MySQL Community Server 8.0.26](https://dev.mysql.com/downloads/mysql/)
- [EJS](https://ejs.co/)
- [Bootstrap 5.1](https://getbootstrap.com/docs/5.1/getting-started/introduction/)



### Solicitud de Información

- [Formulario para acceso al registro de acceso a datos abiertos de Metrobús](https://forms.office.com/Pages/ResponsePage.aspx?id=fmda5wBBMUS4nuV02NmQEBAjAkiQSeRPm_l9XWJZUPFUNUxOUkFKT1FZTE41WEtSOVo2MkJSTUIzVi4u)

### Para consumo de API's

- [Datos Abiertos - Dependencias Metrobús](https://datos.cdmx.gob.mx/dataset/prueba_fetchdata_metrobus/resource/ad360a0e-b42f-482c-af12-1fd72140032e?inner_span=True)
- [OpenCage](https://opencagedata.com/)


