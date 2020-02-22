//running this instead of app e.g. 'node appSSL.js' instead of 'node app.js' lets you pretend to serve your page over HTTPS
//HTTPS is required for other devices connecting your localhost (i.e. mobile) to access accelerometers and other device sensors.
//note this is a bit hacky and if you restart your serve your browser may not let you visit as the new SSLL cert != the new one
//if this happens clear all your browsing data and restart browser (confirmed this workd on ios safari)
//for desktop use Chrome as it seems to alows let you bypass ("proceeding to unsafe site")

//!!NOTE: If the below steps are all too much check out https://ngrok.com. 
//There is a free tier and it works quite well. You can then just run app.js and get a https URL from running ngrok

//STEPS (this will allow Aframe/WebXR API access mobile platform sensors when accessing this server):
//1. run 'node createCerts.js'
//2. run 'node appSSL.js'
//3. go to 'https://localhost:1111'
//4. ignore "safety warnings" from brwoser and go ahead to site anyhow
//5. after creating certs you shouldn't have to run 'node createCerts.js' again until you move to another machine

const https     = require('https');
const forge     = require('node-forge');
const fs        = require('fs');
const express   = require('express');
const app       = express();
const socketIO  = require('socket.io')(server);

//const vars
const LISTEN_PORT = 8080;

//middleware - set default html folder
app.use(express.static(__dirname + '/public'));

/************* CREATE ROUTES ***************/
app.get('/', function(req,res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/player1', function(req,res) {
    res.sendFile(__dirname + '/public/player1.html');
});

app.get('/player2', function(req,res) {
    res.sendFile(__dirname + '/public/player2.html');
});

/************* WEBSOCKET STUFF ***************/
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

/************* LOAD SSL CERTS (if you ran 'node createCerts.js') ***************/
let privateKeyPem = '';
let certPem = '';

//check for ssl cert files
if (fs.existsSync('./SSL_PRIV_KEY.pem')) {
    privateKeyPem = fs.readFileSync('./SSL_PRIV_KEY.pem', 'utf8');
    console.log(privateKeyPem);
}
else {
    console.warn("run 'node ./createCerts.js' first");
    process.exit(); //kill process so we can run
}

if (fs.existsSync('./SSL_CERT.pem')) {
    certPem = fs.readFileSync('./SSL_CERT.pem', 'utf8');
    console.log(certPem);
}    
else {
    console.warn("run 'node ./createCerts.js' first");
    process.exit(); //kill process so we can run
}

/************* CREATE HTTPS SERVER ***************/
console.log('HTTPS server being created ...');
const options = {
    key: privateKeyPem,
    cert: certPem
};
const secureServer = https.createServer(options, app);



/************* RUN HTTPS SERVER ***************/
secureServer.listen(LISTEN_PORT);     //start server
console.log('Listening on port: ' + LISTEN_PORT );