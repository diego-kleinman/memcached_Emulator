const port = 3000;
const express = require('express');
const app = express();
const http = require('http');
const { parse } = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let cache = {
}

let currentClientsInputs = {
}

io.on('connection', (socket) => {
    console.log('new client connected --> Socket id: ' + socket.id)
    currentClientsInputs[socket.id] = [undefined, ""]

    socket.on('message', (data) => {
        try {
            if (currentClientsInputs[socket.id][0] === undefined) {
                proccessCommand(socket, data)
            }
            else {
                processValue(socket, data)
            }
        } catch (error) {
            socket.send(`SERVER_ERROR Something went wrong \r\n`)
        }
    })

    socket.on('disconnect', () => {
        console.log("Socket :" + socket.id + " disconnected")
        delete currentClientsInputs[socket.id]
    })
})

io.on('disconnect', (event) => {
    console.log('disconnected')
})

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});

const proccessCommand = (socket, input) => {
    let data = input.trim().split(' ')
    let command = data[0]
    switch (command) {
        case "get":
            getFunction(socket, data)
            break;
        case "gets":
            break;
        case "set":
            //If command is valid I add it to currentClientsInputs
            if (storageCommandValidator(data)) {
                createCommand(socket.id, command, data)
            }
            else {
                socket.send("CLIENT_ERROR bad command line format")
            }
            break;
        case "add":
            break;
        case "replace":
            break;
        case "append":
            break;
        case "prepend":
            break;
        case "cas":
            break;
        default:
            socket.send("ERROR")
            break;
    }
}

const createCommand = (socketId, command, data) => {
    // Put the command in the key asociated with the socket into the currentClientsInputs object
    let newCommand = {
        "command": command,
        "key": data[1],
        "flags": data[2],
        "exptime": parseInt(data[3]),
        "bytes": parseInt(data[4])
    }
    currentClientsInputs[socketId][0] = newCommand
}

//CHEQUEAR SI PARÁMETRO CAS ES OPCIONAL
//CHEQUEAR PARÁMETRO CAS
//let cas = data[5] 
const storageCommandValidator = (data) => {
    let result = false
    //Check for command, key, flags, exptime, bytes
    if (data.length >= 5) {
        let key = data[1]
        let flags = data[2]
        let exptime = data[3]
        let bytes = data[4]

        //check max length of key
        if (key.length > 250) {
            return result
        }
        //Check flags 16 bits unsigned integer
        else if ((flags % flags) !== 0 && parseInt(flags) !== 0 || parseInt(flags) > 65535) {
            return result
        }
        //Check bytes integer // bytes !== 0 // bytes less than max storage possible (1MB -- 1048576 bytes) // bytes not negative
        else if ((bytes % bytes) !== 0 || parseInt(bytes) > 1048576 || parseInt(bytes) < 0) {
            return result
        }
        // Check exptime integer
        else if ((exptime % exptime) !== 0 && parseInt(exptime) !== 0) {
            return result
        }
        //If all checks are OK
        else {
            result = true
            return result
        }
    }
    return result

}

const processValue = (socket, value) => {
    let commandLine = currentClientsInputs[socket.id][0]
    let currentValue = currentClientsInputs[socket.id][1]
    let trimmed = value.trim()

    //Check if user wrote something
    if (trimmed.length !== 0) {

        //If length is exactly as expected I process the input depending on the command asociated
        if (currentValue.length + trimmed.length === commandLine.bytes) {
            let value = currentValue + trimmed
            switch (commandLine.command) {
                case "set":
                    setFunction(commandLine, value, socket)
                    break;
                case "add":
                    addFunction(commandLine, value, socket)
                    break;
                case "replace":
                    replaceFunction(commandLine, value, socket)
                    break;
                case "append":
                    break;
                case "prepend":
                    break;
                case "cas":
                    break;
                default:
                    socket.send("Proccess value switch error")
                    break;
            }
        }
        //If it's less I add the data to the value and keep listening for new inputs
        else if (currentValue.length + trimmed.length < commandLine.bytes) {
            currentClientsInputs[socket.id][1] += trimmed
        }
        //If length is greater than defined bytes I return error and erase the data of the currentClient
        else {
            socket.send("CLIENT_ERROR bad data chunk")
            currentClientsInputs[socket.id] = [undefined, ""]
        }
    }
    else {
        socket.send("CLIENT_ERROR bad data chunk")
        currentClientsInputs[socket.id] = [undefined, ""]
    }
}

const setFunction = (commandLine, value, socket) => {
    let { key, flags, exptime, bytes, cas } = commandLine

    putObjectInCache(key, value, flags, exptime, bytes, cas)
    currentClientsInputs[socket.id] = [undefined, ""]
    socket.send("STORED")
}

const addFunction = (commandLine, value, socket) => {
    let { key, flags, exptime, bytes, cas } = commandLine

    //If key isn't in cache I can add it
    if (cache[key] === undefined) {
        putObjectInCache(key, value, flags, exptime, bytes, cas)
        currentClientsInputs[socket.id] = [undefined, ""]
        socket.send("STORED")
    }
    else {socket.send("NOT_STORED")}
}

const replaceFunction = (commandLine, value, socket) => {
    let { key, flags, exptime, bytes, cas } = commandLine

    //If key isn't in cache I can add it
    if (cache[key] !== undefined) {
        putObjectInCache(key, value, flags, exptime, bytes, cas)
        currentClientsInputs[socket.id] = [undefined, ""]
        socket.send("STORED")
    }
    else {socket.send("NOT_STORED")}
}

const getFunction = (socket, data) => {
    let response = ""
    for (let i = 1; i < data.length; i++) {
        let cacheObject = cache[data[i]]
        if (cacheObject !== undefined) {
            response += `VALUE ${data[i]} ${cacheObject.flags} ${cacheObject.bytes}\n${cacheObject.value}\n`
        }
    }
    response += "END"
    socket.send(response)
}

const putObjectInCache = (key, value, flags, exptime, bytes, cas) => {
    //If exptime < 0 , value is not stored in cache
    try {
        if (exptime >= 0) {
            let newCacheObject = {
                "value": value,
                "flags": flags,
                "exptime": exptime,
                "bytes": bytes,
                "cas": cas
            }
            cache[key] = newCacheObject
        }
    } catch (error) {
        console.log(error)
    }
}

