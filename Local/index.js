const routes = require('./scr/routes');
const express = require("express");
const app = express();

app.use(routes);

//Motor de plantillas
app.set('view engine','ejs');
app.set('views',__dirname + '/views');
app.use(express.static(__dirname + "/public"));

//Escucharemos en el puerto 3000
app.listen(3000, () => {
    console.log('Estoy escuchando en el puerto 3000')
})



module.exports = app