var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
 
app.use(express.static(__dirname + '/public'));

//Ante un get al root "/" de la IP del servidor devolvemos el index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//communication between web clients and servers (detects user/s dis/connected)
io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

//Ejecutamos el servidor escuchando en el puerto 8081
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});