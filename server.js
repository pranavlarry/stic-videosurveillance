'use strict';
const hbs=require('hbs');
const express = require('express');
const app = express();
var client=0,camid,clientid;
var server=app.listen(8080,()=>{
  console.log('listening on port 4000')
});
const io = require('socket.io').listen(server);
app.set('view engine','hbs');
app.use("/scripts", express.static(`${__dirname}/app/js`));
app.get('/camera',(req,res)=>{

  res.sendFile(`${__dirname}/app/camera.html`);
});
app.get('/',(req,res)=>{
  // res.render('client.hbs',{});
  res.sendFile(`${__dirname}/app/client.html`);
});
io.on('connection',function(socket){
  socket.on('clientID',()=>{
    clientid=socket.id;
  });
  socket.on('camID',()=>{
    camid=socket.id;
  });
  socket.on('channelReady',()=>{
    client=client+1;
    console.log(client);
    io.to(camid).emit('channelReady',client);
    io.to(clientid).emit('channelReady',client);
  });
  socket.on('message', function(message) {
    if(socket.id===camid){
      io.to(clientid).emit('message', message);
    }else{
      io.to(camid).emit('message', message);
    }


  });

});
