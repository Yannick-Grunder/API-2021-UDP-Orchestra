// imports
const dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');

//socket 
const socket = dgram.createSocket('udp4');

//multicast adress and port
const MULTICAST_ADDRESS = "239.255.22.5";
const MULTICAST_PORT = 9907;

// map of instruments to their sound
const instrToSound = new Map();
instrToSound.set("piano", "ti-ta-ti");
instrToSound.set("trumpet", "pouet");
instrToSound.set("flute", "trulu");
instrToSound.set("violin", "gzi-gzi");
instrToSound.set("drum", "boum-boum");

// get instrument from arrguments
const instrument = process.argv[2];

//make sure the instrument received is valid
if(!(instrToSound.has(instrument))){
    console.log("Invalid instrument");
    process.exit(1);
}

// get the right sound for the instrument
const sound = instrToSound.get(instrument);

// make a uuid
const UUID = uuidv4();

//Function that sends the sound to UDP multicast

function play(){
    // makes the data into an object 
    const dataObject = {
        uuid : UUID,
        sound : sound
    }

    //makes the data object into a json
    const jsonToSend = JSON.stringify(dataObject)

    // Send payload as UDP datagram
    socket.send(jsonToSend, 0, jsonToSend.length, MULTICAST_PORT, MULTICAST_ADDRESS, function(err, bytes) {
        console.log("Sending payload: " + jsonToSend + " via port " + socket.address().port);
    });
}

//send the sound then play it every second
play();
setInterval(() => play(), 1000);
