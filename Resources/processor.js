const {setFunction,addFunction,replaceFunction,appendFunction,prependFunction,casFunction,flushFunction,getFunction,getsFunction} = require('./functions')
const validator = require('./validators')

//socket.id : [ command input, value input, firstInputLine (true,false) ]
/**
 * Js object that represents "key : value" pairs of current inputs from clients connected to server
 * 
 * Keys are socket id's and values are arrays of: [command, value, firstLine]
 * 
 * "firstLine" is a boolean that identifies if client is sending it's first line of value input
 * 
 * For example --> "12390i20198" : ["set test 2 0 2", "ab", true]
 */
// const currentClientsInputs = {
// }

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
            'flush_all': () => flushFunction(socket),
            'get': () => getFunction(socket, data),
            'gets': () => getsFunction(socket, data),
            'cas': () => processCasHelper(socket, data),
            'set': () => processCommandHelper(socket, data),
            'add': () => processCommandHelper(socket, data),
            'replace': () => processCommandHelper(socket, data),
            'append': () => processCommandHelper(socket, data),
            'prepend': () => processCommandHelper(socket, data)
        }

        //If command exists, execute it
        if (mapper[command] !== undefined) {
            mapper[command]()
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

    const command = data[0]
    const key = data[1]
    const flags = data[2]
    const exptime = parseInt(data[3])
    const bytes = parseInt(data[4])
    //it can be something or undefined / optional parameter
    const noreply = data[5]

    // Create command and put it in the client input
    currentClientsInputs[socketId][0] = { command, key, flags, exptime, bytes, noreply }
}

/**
 * This function creates a cas-command object from client's input and puts it to the currentClientsInputs object
 * @param {string} socketId : Id of client's socket
 * @param {[string]} data Array containing command from client splitted by spaces
 */
const createCasCommand = (socketId, data) => {

    const command = data[0]
    const key = data[1]
    const flags = data[2]
    const exptime = parseInt(data[3])
    const bytes = parseInt(data[4])
    const cas = parseInt(data[5])
    //it can be something or undefined / optional parameter
    const noreply = data[6]
    // Create command and put it in the client input
    currentClientsInputs[socketId][0] = { command, key, flags, exptime, bytes, cas, noreply }
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
            'set': () => setFunction(commandLine, value, socket, boolean),
            'add': () => addFunction(commandLine, value, socket, boolean),
            'replace': () => replaceFunction(commandLine, value, socket, boolean),
            'append': () => appendFunction(commandLine, value, socket, boolean),
            'prepend': () => prependFunction(commandLine, value, socket, boolean),
            'cas': () => casFunction(commandLine, value, socket, boolean)
        }
        //Execute function depending on the command client has put
        const response = mapper[commandLine.command]()
        sendResponse(socket, response, boolean)

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
    (noreply) ? null : socket.send(response)
}