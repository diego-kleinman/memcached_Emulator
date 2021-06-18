const { setFunction, addFunction, replaceFunction, appendFunction, prependFunction, casFunction, flushFunction, getFunction, getsFunction } = require('./functions')
const { storageCommandValidator, casCommandValidator } = require('./validators')
const { createCasCommand, createCommand, initializeClientInput } = require('./storageManager')

module.exports = {
    /**
     * This function triggers different actions depending on the command input from client
     * @param {socket} socket Socket client is connected from
     * @param {string} input Command input from client
     */
    proccessCommand: (socket, input) => {
        const data = input.trim().split(' ')
        const command = data[0]
        
        const mapper = {
            'flush_all': () => flushFunction(),
            'get': () => getFunction(data),
            'gets': () => getsFunction(data),
            'cas': () => processCasHelper(socket, data),
            'set': () => processCommandHelper(socket, data),
            'add': () => processCommandHelper(socket, data),
            'replace': () => processCommandHelper(socket, data),
            'append': () => processCommandHelper(socket, data),
            'prepend': () => processCommandHelper(socket, data)
        }
        //If command exists, execute it
        if (mapper[command] !== undefined) {
            //These commands have direct responses
            if(command === "get" || command === "gets" || command == "flush_all"){
                const response = mapper[command]()
                socket.send(response)
            }
            //Other commands are just to create the command
            else{
                mapper[command]()
            }
        }
        else {
            socket.send("ERROR")
        }
    },
    /**
     * This function triggers different actions depending on the value input from client
     * @param {socket} socket Socket client is connected from
     * @param {string} value Value input from client
     */
    processValue: (socket, value) => {
        const commandLine = currentClientsInputs[socket.id][0]
        const currentValue = currentClientsInputs[socket.id][1]
        const firstLine = currentClientsInputs[socket.id][2]
        const trimmed = value.trim()
        //If it's first valueInput line, server doesn't count "\n" as an input ; For other lines it is counted
        firstLine ? proccessValueHelper(socket, commandLine, currentValue, trimmed) : proccessValueHelper(socket, commandLine, currentValue, value)
    }
}

/**
 * Helper function for processing storage non-cas commands
 * @param {socket} socket Socket client is connected from
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const processCommandHelper = (socket, data) => {
    //If command is valid
    if (storageCommandValidator(data)) {
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
    if (casCommandValidator(data)) {
        createCasCommand(socket.id, data)
    }
    else {
        socket.send("CLIENT_ERROR bad command line format")
    }
}

/**
 * This function is in charge of controlling value sent from client: 
 * 
 * Depending on that it triggers the corresponding action from the server
 * @param {socket} socket Socket client is connected from
 * @param {string} commandLine Command client has put
 * @param {string} currentValue Current value client has put
 * @param {string} input Value client is sending to the server
 */
const proccessValueHelper = (socket, commandLine, currentValue, input) => {

    //For memcached "\n" represents "\r\n"
    input = input.replace("\n", "\r\n")

    //If length of (currentValue + input) is exactly as expected 
    //The server processes the input depending on the command asociated
    if (currentValue.length + input.length === commandLine.bytes) {
        const value = currentValue + input
        //If noreply param is equal to "noreply", server doesn't have to respond
        const boolean = (commandLine.noreply === "noreply")

        const mapper = {
            'set': () => setFunction(commandLine, value),
            'add': () => addFunction(commandLine, value),
            'replace': () => replaceFunction(commandLine, value),
            'append': () => appendFunction(commandLine, value),
            'prepend': () => prependFunction(commandLine, value),
            'cas': () => casFunction(commandLine, value)
        }
        //Execute function depending on the command client has put
        const response = mapper[commandLine.command]()
        //After the command is executed, server resets the current input from the client (command, value and firstLine)
        initializeClientInput(socket.id)
        sendResponse(socket, response, boolean)
    }
    //If it's less than expected, the server add's the input to the value and keeps listening for new inputs
    else if (currentValue.length + input.length < commandLine.bytes) {
        currentClientsInputs[socket.id][1] += input
        //First input line has been already processed
        currentClientsInputs[socket.id][2] = false
    }
    //If it's greater than expected, server resets the current input from the client and returns error to client
    else {
        initializeClientInput(socket.id)
        socket.send("CLIENT_ERROR bad data chunk")
    }
}

/**
 * This function sends a respond to the user depending on "noreply" parameter
 * @param {socket} socket Socket client is connected from
 * @param {string} response Response to send
 * @param {boolean} noreply Boolean representing if client want's the server to respond or not
 */
const sendResponse = (socket, response, noreply) => {
    (noreply) ? null : socket.send(response)
}