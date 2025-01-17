const express   = require('express');
const app       = express();
const http      = require('http');
const server    = http.createServer(app);
const socketIO  = require('socket.io')(server);

const LISTEN_PORT = 8080; //make sure greater than 3000. Some ports are reserved/blocked by firewall ...

app.use((express.static(__dirname + '/public'))); //set root dir to the public folder

//routes
app.get('/', function(req,res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/player1', function(req,res) {
    res.sendFile(__dirname + '/public/player1.html');
});

app.get('/player2', function(req,res) {
    res.sendFile(__dirname + '/public/player2.html');
});

socketIO.on('connection', function(socket) {
    console.log(socket.id + ' has connected!');

    socket.on('disconnect', function(data) {
        console.log(socket.id + ' has disconnected');
    });

    socket.on('player1Portal', function(data){
        console.log('player 1 portal event heard')
        socketIO.sockets.emit("Player2SpawnBall")
    });

    socket.on("player2Portal", function(data){
        console.log('player 2 portal event heard')
        socketIO.sockets.emit("Player1SpawnBall")
    });
    
    socket.on("player1Win", function(data){
        console.log('player 1 win event heard')
        socketIO.sockets.emit("Player2Loss")
    });
    
    socket.on("player2Win", function(data){
        console.log('player 2 win event heard')
        socketIO.sockets.emit("Player1Loss")
    });

});

//finally, start server
server.listen(LISTEN_PORT);
console.log('listening to port: ' + LISTEN_PORT);