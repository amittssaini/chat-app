const express = require('express');
const cors = require('cors');
const { Socket } = require('socket.io');
require('dotenv').config();


// starting the port 
const PORT = process.env.PORT
const app = express();
const server = app.listen(PORT,()=>console.log(`PORT IS LISTENING AT THE PORT ${PORT}`))

// middeware to connect frontend and backend 

app.use(cors());

// starting the socket 

const io = require('socket.io')(server);

const totalUser=new Set();
const onConnected=(socket)=>{
    

    totalUser.add(socket.id);
    console.log('total-users is :: ',totalUser.size);
    io.emit('total-clients',totalUser.size);

    //disconnect 

    socket.on('disconnect',()=>{
        console.log('socket is disconnect',socket.id);
        totalUser.delete(socket.id);
        io.emit('total-clients',totalUser.size);
    })

    // message 

    socket.on('message',(data)=>{
        console.log(data);
        socket.broadcast.emit('chat-message',(data));
    })

    //feedback

    socket.on('feedback',(data)=>{
        socket.broadcast.emit('feedback',data);
    })
}
io.on('connection',onConnected);
