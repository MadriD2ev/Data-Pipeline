
/* 
    BD creada en MariaDB 
*/

SHOW DATABASES; 

/*
    Crear la base de datos
*/

CREATE DATABASE metrobus_cdmx;
USE metrobus_cdmx;

/*
    Crear las tablas correspondientes
*/

CREATE TABLE PruebaDatosMetrobus
    (latitudAlcaldia FLOAT NOT NULL, latitudMetrobus FLOAT NOT NULL, 
    nombreAlcaldia  VARCHAR(50), vehicle_id INT NOT NULL, vehicle_label INT NOT NULL, 
    trip_schedule_relationship INT NOT NULL, geographic_point VARCHAR(100),
    idRegistro BIGINT NOT NULL AUTO_INCREMENT,PRIMARY KEY (idRegistro)
);