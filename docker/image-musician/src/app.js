// imports
const dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');

//socket 
const socket = dgram.createSocket('udp4');

const MULTICAST_ADDRESS = "235.255.22.5";
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
if(!(instrument in instrToSound)){
    console.log("Invalid instrument");
    process.exit(1);
}

// get the right sound for the instrument
const sound = instrToSound[instrument];

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

    //makes the json into a sendable buffer
    const payload = new Buffer(jsonToSend)
    

    // Send payload as UDP datagram
    s.send(payload, 0, payload.length, MULTICAST_ADDRESS, MULTICAST_PORT, function(err, bytes) {
        console.log("Sending payload: " + payload + " via port " + s.address().port);
    });
}

//send the sound then play it every second
play();
setInterval(() => play(), 1000);
