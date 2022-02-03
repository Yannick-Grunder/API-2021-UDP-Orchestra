// imports
const dgram = require('dgram');
const net = require('net');

// namming the multicast ip and port as well as the TCP port
const MULTICAST_ADDRESS = "239.255.22.5";
const MULTICAST_PORT = 33173;

const TCP_PORT = 2205

// map of sounds to intruments
const soundToInstr = new Map();
soundToInstr.set('ti-ta-ti', 'piano');
soundToInstr.set('pouet', 'trumpet');
soundToInstr.set('trulu', 'flute');
soundToInstr.set('gzi-gzi', 'violin');
soundToInstr.set('boum-boum', 'drum');

// array to store what we "hear"
var musicians = [];

// UDP listening
const udpSocket = dgram.createSocket('udp4');
udpSocket.bind(MULTICAST_PORT, function() {
    console.log("Joining multicast with ip : " + MULTICAST_ADDRESS);
    udpSocket.addMembership(MULTICAST_ADDRESS);
});

udpSocket.on('message', function(msg, source) {
    console.log("Data had arrived: " + msg + ". Source port: " + source.port);

    var dataObject = JSON.parse(msg);

    var newData = true;
    musicians.forEach(function(musicians) {
        if(musicians.uuid === dataObject.uuid){
            newData = false;
        }
    });

    if(newData){
        console.log("New musician with uuid : " + dataObject.uuid);
        const newMusician = {
            uuid : dataObject.uuid,
            instrument : soundToInstr.get(dataObject.sound),
            activeSince : new Date(Date.now()).toISOString(),
            secondsSinceLastUpdate : 0
        };

        musicians.push(newMusician);

    } else {
        console.log("Musician with uuid : " + dataObject.uuid + " is still active");
        var musicianToUpdate = musicians.find(musician => musician.uuid === dataObject.uuid);
        musicianToUpdate.secondsSinceLastUpdate = 0;
    }
});

udpSocket.on('error', function (err) {
    console.log(err);
});
// function to keep only active musicians (5 seconds since last update)
function updateMusicians() {
    // update the timer
    musicians.forEach(musician => musician.secondsSinceLastUpdate++);

    // delete those that have stopped playing
    musicians = musicians.filter(musician => musician.secondsSinceLastUpdate <= 5);
}

// now every second
setInterval(() => updateMusicians(), 1000);



// TCP server
var tcpServer = net.createServer(function(socket) {
    console.log("Connexion received on TCP server.")

    var payload = JSON.stringify(musicians);

    // We dont want the secondsSinceLastUpdate part
    payload.forEach(musician => delete musician.secondsSinceLastUpdate);

    //send the payload then close the socket
    socket.write(JSON.stringify(payload));
    socket.pipe(socket);
    socket.destroy();
})