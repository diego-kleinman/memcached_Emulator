//Import validator
const processor = require("./Resources/processor")

//Create server
const port = 3000;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

global.cache = {}
global.currentClientsInputs = {}
global.currentCas = 1

// When a client connects to server
io.on('connection', (socket) => {
    console.log('new client connected --> Socket id: ' + socket.id)
    // Initializes the client input
    currentClientsInputs[socket.id] = [undefined, "", true]

    //When server recieves a message from a client connected
    socket.on('message', (data) => {
        try {
            // If the client is sending a command
            if (currentClientsInputs[socket.id][0] === undefined) {
                processor.proccessCommand(socket, data)
            }
            // If the client is sending a value
            else {
                processor.processValue(socket, data)
            }
        } catch (error) {
            socket.send(`SERVER_ERROR Something went wrong \r\n`)
        }
    })

    //When a client disconnects, server erases the client input
    socket.on('disconnect', () => {
        console.log("Socket :" + socket.id + " disconnected")
        delete currentClientsInputs[socket.id]
    })
})

// When server itself disconnects
io.on('disconnect', (event) => {
    console.log('disconnected')
})

//The servers starts listening to the port
server.listen(port, () => {
    console.log(`listening on port ${port}`);
});



/**
 * This function is in charge of purging expired keys
 * 
 * It goes through the cache and resets exptime values or deletes cache objects
 */
const purgeProcess = () => {
    Object.keys(cache).forEach(element => {
        let { exptime } = cache[element]
        if (exptime === 1) {
            delete cache[element]
        }
        else if (exptime > 1) {
            cache[element].exptime = exptime - 1
        }
    });
    setTimeout(purgeProcess, 1000);
}

purgeProcess();