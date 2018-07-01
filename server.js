'use strict';

const express = require('express');
const app = express();
var server=app.listen(8080,()=>{
  console.log('listening on port 4000')
});
const io = require('socket.io').listen(server);

app.use(express.static('public'));
var numClients;
io.on('connection',function(socket)
{

  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }
  socket.on('message', function(message) {
    log('Client said: ', message);
    socket.broadcast.emit('message', message);
  });


  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;

    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } //else { // max two clients
     // socket.emit('full', room);
    //}
  });
  socket.on('hangup',function(){
    numClients = numClients-1;
    var message='bye';
    socket.broadcast.emit('message',message);
  });

});
