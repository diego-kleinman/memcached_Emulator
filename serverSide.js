//Import validator
const validator = require("./validators")

//Create server
const port = 3000;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

/**
 * Variable that represents the current cas value being used by the server
 * 
 * This value updates everytime a storage function executes
 */
let currentCas = 1

/**
 * Js object that represents "key : value" pairs currently stored in the server
 * 
 * For example --> "test" : { value = "ab", flags = 2, exptime = 0 , bytes = 2 ,cas = 2 }
 */
let cache = {
}

//socket.id : [ command input, value input, firstInputLine (true,false) ]
/**
 * Js object that represents "key : value" pairs of current inputs from clients connected to server
 * 
 * Keys are socket id's and values are arrays of: [command, value, firstLine]
 * 
 * "firstLine" is a boolean that identifies if client is sending it's first line of value input
 * 
 * For example --> "12390i20198" : { "set test 2 0 2", "ab", true}
 */
let currentClientsInputs = {
}

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
 * This function triggers different actions depending on the command input from client
 * @param {socket} socket Socket client is connected from
 * @param {string} input Command input from client
 */
const proccessCommand = (socket, input) => {
    let data = input.trim().split(' ')
    let command = data[0]
    //If the command is "get" I just execute the function
    if (command === "get") {
        getFunction(socket, data)
    }
    //Also for "gets" command
    else if (command === "gets") {
        getsFunction(socket, data)
    }
    else if (command === "cas") {
        processCasHelper(socket, data)
    }
    else if (command === "set" || command === "add" || command === "replace" || command === "append" || command === "prepend") {
        processCommandHelper(socket, data)
    }
    else {
        socket.send("ERROR")
    }
}

/**
 * Helper function for processing storage non-cas commands
 * @param {socket} socket Socket client is connected from
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const processCommandHelper = (socket, data) => {
    //If command is valid
    if (validator.storageCommandValidator(data)) {
        createCommand(socket.id, data)
    }
    else {
        socket.send("CLIENT_ERROR bad command line format")
    }
}

/**
 * Helper function for processing cas command
 * @param {socket} socket Socket client is connected from
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const processCasHelper = (socket, data) => {
    //If command is valid
    if (validator.casCommandValidator(data)) {
        createCasCommand(socket.id, data)
    }
    else {
        socket.send("CLIENT_ERROR bad command line format")
    }
}

/**
 * This function creates a command object from client's input and puts it to the currentClientsInputs object
 * @param {string} socketId : Id of client's socket
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const createCommand = (socketId, data) => {
    // create command
    let newCommand = {
        "command": data[0],
        "key": data[1],
        "flags": data[2],
        "exptime": parseInt(data[3]),
        "bytes": parseInt(data[4]),
        //it can be something or undefined / optional parameter
        "noreply": data[5]
    }
    // put it in the client input
    currentClientsInputs[socketId][0] = newCommand
}

/**
 * This function creates a cas-command object from client's input and puts it to the currentClientsInputs object
 * @param {string} socketId : Id of client's socket
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const createCasCommand = (socketId, data) => {
    // create cas-command
    let newCasCommand = {
        "command": data[0],
        "key": data[1],
        "flags": data[2],
        "exptime": parseInt(data[3]),
        "bytes": parseInt(data[4]),
        "cas": parseInt(data[5]),
        //it can be something or undefined / optional parameter
        "noreply": data[6]
    }
    // put it in the client input
    currentClientsInputs[socketId][0] = newCasCommand
}

/**
 * This function triggers different actions depending on the value input from client
 * @param {socket} socket Socket client is connected from
 * @param {string} value Value input from client
 */
const processValue = (socket, value) => {
    //Get command that client has put
    let commandLine = currentClientsInputs[socket.id][0]
    //Get value that client has put
    let currentValue = currentClientsInputs[socket.id][1]
    //Get boolean representing if it's first valueInput line
    let firstLine = currentClientsInputs[socket.id][2]
    let trimmed = value.trim()

    //If it's first valueInput line, server doesn't count "\n" as an input
    if (firstLine) {
        proccessValueHelper(socket, commandLine, currentValue, trimmed)
    }
    //For other lines it is counted
    else {
        proccessValueHelper(socket, commandLine, currentValue, value)
    }
}

/**
 * This function is in charge of controlling value sent from client: 
 * 
 * Depending on that it triggers the corresponding action from the server
 * @param {socket} socket Socket client is connected from
 * @param {*} commandLine Command client has put
 * @param {*} currentValue Current value client has put
 * @param {*} input Value client is sending to the server
 */
const proccessValueHelper = (socket, commandLine, currentValue, input) => {

    //For memcached "\n" represents "\r\n"
    input = input.replace("\n", "\r\n")

    //If length of (currentValue + input) is exactly as expected 
    //The server processes the input depending on the command asociated
    if (currentValue.length + input.length === commandLine.bytes) {
        let value = currentValue + input
        let { noreply } = commandLine
        let boolean = false
        //If noreply param is equal to "noreply", server doesn't have to respond
        if (noreply === "noreply") {
            boolean = true
        }
        //Execute function depending on the command client has put
        switch (commandLine.command) {
            case "set":
                setFunction(commandLine, value, socket, boolean)
                break;
            case "add":
                addFunction(commandLine, value, socket, boolean)
                break;
            case "replace":
                replaceFunction(commandLine, value, socket, boolean)
                break;
            case "append":
                appendFunction(commandLine, value, socket, boolean)
                break;
            case "prepend":
                prependFunction(commandLine, value, socket, boolean)
                break;
            case "cas":
                casFunction(commandLine, value, socket, boolean)
                break;
            default:
                break;
        }
        //After the command is executed, server resets the current input from the client (command, value and firstLine)
        resetInput(socket)
    }
    //If it's less than expected, the server add's the input to the value and keeps listening for new inputs
    else if (currentValue.length + input.length < commandLine.bytes) {
        currentClientsInputs[socket.id][1] += input
        //First input line has been already processed
        currentClientsInputs[socket.id][2] = false
    }
    //If it's greater than expected, server resets the current input from the client and returns error to client
    else {
        resetInput(socket)
        socket.send("CLIENT_ERROR bad data chunk")
    }
}

/**
 * This function represents the "get" function from memcached
 * @param {socket} socket Socket client is connected from
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const getFunction = (socket, data) => {
    //Go over all the keys that client want's to get, generate a response matching memcached protocol
    let response = ""
    for (let i = 1; i < data.length; i++) {
        let cacheObject = cache[data[i]]
        if (cacheObject !== undefined) {
            response += `VALUE ${data[i]} ${cacheObject.flags} ${cacheObject.bytes}\n${cacheObject.value}\n`
        }
    }
    response += "END"
    //Send it to the client
    socket.send(response)
}

/**
 * This function represents the "gets" function from memcached
 * @param {socket} socket Socket client is connected from
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const getsFunction = (socket, data) => {
    //Go over all the keys that client want's to get, generate a response matching memcached protocol
    let response = ""
    for (let i = 1; i < data.length; i++) {
        let cacheObject = cache[data[i]]
        if (cacheObject !== undefined) {
            response += `VALUE ${data[i]} ${cacheObject.flags} ${cacheObject.bytes} ${cacheObject.cas}\n${cacheObject.value}\n`
        }
    }
    response += "END"
    //Send it to the client
    socket.send(response)
}

/**
 * This function represents the "cas" function from memcached
 * @param {string} commandLine Command client has put
 * @param {string} value Value client has put
 * @param {socket} socket Socket client is connected from
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const casFunction = (commandLine, value, socket, noreply) => {
    let { key, flags, exptime, bytes, cas } = commandLine
    let response = ""

    //If object exists in cache
    if (cache[key] !== undefined) {
        //If cas from parameter corresponds to the object cas
        if (cache[key].cas === cas) {
            putObjectInCache(key, value, flags, exptime, bytes)
            response = "STORED"
        }
        else {
            response = "EXISTS"
        }

    }
    else {
        response = "NOT_FOUND"
    }
    sendResponse(socket, response, noreply)
}

/**
 * This function represents the "append" function from memcached
 * @param {string} commandLine Command client has put
 * @param {string} value Value client has put
 * @param {socket} socket Socket client is connected from
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const appendFunction = (commandLine, value, socket, noreply) => {
    let { key, bytes } = commandLine
    let response = ""
    //If key is already in cache, append value
    if (cache[key] !== undefined) {
        let newBytes = cache[key].bytes + bytes
        let newValue = cache[key].value + value
        cache[key].bytes = newBytes
        cache[key].value = newValue
        cache[key].cas = currentCas
        currentCas++
        response = "STORED"
    }
    else { response = "NOT_STORED" }
    sendResponse(socket, response, noreply)
}

/**
 * This function represents the "prepend" function from memcached
 * @param {string} commandLine Command client has put
 * @param {string} value Value client has put
 * @param {socket} socket Socket client is connected from
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const prependFunction = (commandLine, value, socket, noreply) => {
    let { key, bytes } = commandLine
    let response = ""
    //If key is already in cache, prepend value
    if (cache[key] !== undefined) {
        let newBytes = cache[key].bytes + bytes
        let newValue = value + cache[key].value
        cache[key].bytes = newBytes
        cache[key].value = newValue
        cache[key].cas = currentCas
        currentCas++
        response = "STORED"
    }
    else { response = "NOT_STORED" }
    sendResponse(socket, response, noreply)
}

/**
 * This function is the "set" function from memcached
 * @param {string} commandLine Command client has put
 * @param {string} value Value client has put
 * @param {socket} socket Socket client is connected from
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const setFunction = (commandLine, value, socket, noreply) => {
    let { key, flags, exptime, bytes } = commandLine
    putObjectInCache(key, value, flags, exptime, bytes)
    sendResponse(socket, "STORED", noreply)
}

/**
 * This function represents the "add" function from memcached
 * @param {string} commandLine Command client has put
 * @param {string} value Value client has put
 * @param {socket} socket Socket client is connected from
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const addFunction = (commandLine, value, socket, noreply) => {
    let { key, flags, exptime, bytes } = commandLine
    let response = ""

    //If key isn't in cache
    if (cache[key] === undefined) {
        putObjectInCache(key, value, flags, exptime, bytes)
        response = "STORED"
    }
    else { response = "NOT_STORED" }
    sendResponse(socket, response, noreply)
}

/**
 * This function represents the "replace" function from memcached
 * @param {string} commandLine Command client has put
 * @param {string} value Value client has put
 * @param {socket} socket Socket client is connected from
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const replaceFunction = (commandLine, value, socket, noreply) => {
    let { key, flags, exptime, bytes } = commandLine
    let response = ""

    //If key is in cache
    if (cache[key] !== undefined) {
        putObjectInCache(key, value, flags, exptime, bytes)
        response = "STORED"
    }
    else { response = "NOT_STORED" }
    sendResponse(socket, response, noreply)
}

/**
 * This function is in charge of putting an object in cache
 * @param {string} key 
 * @param {string} value 
 * @param {string} flags 
 * @param {number} exptime
 * @param {number} bytes 
 */
const putObjectInCache = (key, value, flags, exptime, bytes) => {
    //If exptime < 0 , value is not stored in cache
    if (exptime >= 0) {
        let newCacheObject = {
            "value": value,
            "flags": flags,
            "exptime": exptime,
            "bytes": bytes,
            "cas": currentCas
        }
        cache[key] = newCacheObject
        currentCas++
    }
}

/**
 * This functions resets a user input (command, value and firstLine boolean)
 * @param {socket} socket Socket client is connected from
 */
const resetInput = (socket) => {
    currentClientsInputs[socket.id] = [undefined, "", true]
}

/**
 * This function sends a respond to the user depending on "noreply" parameter
 * @param {socket} socket Socket client is connected from
 * @param {string} response Response to send
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const sendResponse = (socket, response, noreply) => {
    if (!noreply) {
        socket.send(response)
    }
}