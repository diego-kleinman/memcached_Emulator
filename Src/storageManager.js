
module.exports = {
    /**
     * This function is in charge of initializing a client input
     * @param {string} socketId Id of the socket client is connecting from
     */
    initializeClientInput: (socketId) => {
        currentClientsInputs[socketId] = [undefined, "", true]
    },
    deleteClientInput: (socketId) => {
        delete currentClientsInputs[socketId]
    },
    /**
     * This function creates a command object from client's input and puts it to the currentClientsInputs object
     * @param {string} socketId : Id of client's socket
     * @param {[string]} data Array containing command from client splitted by spaces
     */
    createCommand: (socketId, data) => {

        const command = data[0]
        const key = data[1]
        const flags = data[2]
        const exptime = parseInt(data[3])
        const bytes = parseInt(data[4])
        //it can be something or undefined / optional parameter
        const noreply = data[5]

        // Create command and put it in the client input
        currentClientsInputs[socketId][0] = { command, key, flags, exptime, bytes, noreply }
    },
    /**
     * This function creates a cas-command object from client's input and puts it to the currentClientsInputs object
     * @param {string} socketId : Id of client's socket
     * @param {[string]} data Array containing command from client splitted by spaces
     */
    createCasCommand: (socketId, data) => {

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
    },
    /**
     * This function is in charge of putting an object in cache
     * @param {string} key 
     * @param {string} value 
     * @param {string} flags 
     * @param {number} exptime
     * @param {number} bytes 
     */
    putObjectInCache: (key, value, flags, exptime, bytes) => {
        //If exptime < 0 , value is not stored in cache
        if (exptime >= 0) {
            const cas = currentCas
            cache[key] = { value, flags, exptime, bytes, cas }
            currentCas++
        }
    },
}