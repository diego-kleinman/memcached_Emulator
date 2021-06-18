//Import validator
const { proccessCommand, processValue } = require('./Src/processors')
const { initializeClientInput, deleteClientInput } = require('./Src/storageManager')

//Create server
const port = 3000;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//  /**
//   * Js object that represents "key : value" pairs currently stored in the server
//   * 
//   * For example --> "test" : { value = "ab", flags = 2, exptime = 0 , bytes = 2 ,cas = 2 }
//   */
global.cache = {}

/**
 * Js object that represents "key : value" pairs of current inputs from clients connected to server
 * 
 * Keys are socket id's and values are arrays of: [command, value, firstLine]
 * 
 * "firstLine" is a boolean that identifies if client is sending it's first line of value input
 * 
 * For example --> "12390i20198" : [{command= "cas", value = "ab", flags = 2, exptime = 0 , bytes = 2 ,cas = 2}, "ab", true]
 */
global.currentClientsInputs = {}

/**
 * Variable that represents the current cas value being used by the server
 * 
 * This value updates everytime a storage function executes
 */
global.currentCas = 1

// When a client connects to server
io.on('connection', (socket) => {

    console.log('new client connected --> Socket id: ' + socket.id)
    initializeClientInput(socket.id)

    //When server recieves a message from a client connected
    socket.on('message', (data) => {
        try {
            // If the client is sending a command
            if (currentClientsInputs[socket.id][0] === undefined) {
                proccessCommand(socket, data)
            }
            // If the client is sending a value
            else {
                processValue(socket, data)
            }
        } catch (error) {
            socket.send(`SERVER_ERROR Something went wrong \r\n`)
        }
    })

    //When a client disconnects, server erases the client input
    socket.on('disconnect', () => {
        console.log("Socket :" + socket.id + " disconnected")
        deleteClientInput(socket.id)
    })
})

// When server itself disconnects
io.on('disconnect', () => {
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
        const { exptime } = cache[element]
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