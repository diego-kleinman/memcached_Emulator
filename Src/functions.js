const { putObjectInCache } = require('./storageManager')

module.exports = {
    /**
     * This function represents the "cas" function from memcached
     * @param {string} commandLine Command client has put
     * @param {string} value Value client has put
     */
    casFunction: (commandLine, value) => {
        const { key, flags, exptime, bytes, cas } = commandLine
        let response = ""
        if (cache[key] !== undefined) {
            //If cas from parameter corresponds to the object cas
            if (cache[key].cas === cas) {
                putObjectInCache(key, value, flags, exptime, bytes)
                response = "STORED"
            }
            else { response = "EXISTS" }
        }
        else { response = "NOT_FOUND" }
        return response
    },

    /**
     * This function represents the "append" function from memcached
     * @param {string} commandLine Command client has put
     * @param {string} value Value client has put
     */
    appendFunction: (commandLine, value) => {
        const { key, bytes } = commandLine
        let response = ""
        if (cache[key] !== undefined) {
            cache[key].bytes = cache[key].bytes + bytes
            cache[key].value = cache[key].value + value
            cache[key].cas = currentCas
            currentCas++
            response = "STORED"
        }
        else { response = "NOT_STORED" }
        return response
    },

    /**
     * This function represents the "prepend" function from memcached
     * @param {string} commandLine Command client has put
     * @param {string} value Value client has put
     */
    prependFunction: (commandLine, value) => {
        const { key, bytes } = commandLine
        let response = ""
        if (cache[key] !== undefined) {
            cache[key].bytes = cache[key].bytes + bytes
            cache[key].value = value + cache[key].value
            cache[key].cas = currentCas
            currentCas++
            response = "STORED"
        }
        else { response = "NOT_STORED" }
        return response
    },

    /**
     * This function is the "set" function from memcached
     * @param {string} commandLine Command client has put
     * @param {string} value Value client has put
     */
    setFunction: (commandLine, value) => {
        const { key, flags, exptime, bytes } = commandLine
        putObjectInCache(key, value, flags, exptime, bytes)
        return "STORED"
    },

    /**
     * This function represents the "add" function from memcached
     * @param {string} commandLine Command client has put
     * @param {string} value Value client has put
     */
    addFunction: (commandLine, value) => {
        const { key, flags, exptime, bytes } = commandLine
        let response = ""
        if (cache[key] === undefined) {
            putObjectInCache(key, value, flags, exptime, bytes)
            response = "STORED"
        }
        else { response = "NOT_STORED" }
        return response
    },

    /**
     * This function represents the "replace" function from memcached
     * @param {string} commandLine Command client has put
     * @param {string} value Value client has put
     */
    replaceFunction: (commandLine, value) => {
        const { key, flags, exptime, bytes } = commandLine
        let response = ""
        if (cache[key] !== undefined) {
            putObjectInCache(key, value, flags, exptime, bytes)
            response = "STORED"
        }
        else { response = "NOT_STORED" }
        return response
    },
    /**
     * This function flushes the server
     * @param {socket} socket 
     */
    flushFunction: () => {
        cache = {}
        currentCas = 1
        console.log("Serverside has been flushed")
    },
    /**
     * This function represents the "get" function from memcached
     * @param {socket} socket Socket client is connected from
     * @param {[string]} data Array containing command from client splitted by spaces
     */
    getFunction: (socket, data) => {
        let response = ""
        for (let i = 1; i < data.length; i++) {
            const cacheObject = cache[data[i]]
            if (cacheObject !== undefined) {
                response += `VALUE ${data[i]} ${cacheObject.flags} ${cacheObject.bytes}\n${cacheObject.value}\n`
            }
        }
        response += "END"
        //Send it to the client
        socket.send(response)
    },
    /**
     * This function represents the "gets" function from memcached
     * @param {socket} socket Socket client is connected from
     * @param {[string]} data Array containing command from client splitted by spaces
     */
    getsFunction: (socket, data) => {
        let response = ""
        for (let i = 1; i < data.length; i++) {
            const cacheObject = cache[data[i]]
            if (cacheObject !== undefined) {
                response += `VALUE ${data[i]} ${cacheObject.flags} ${cacheObject.bytes} ${cacheObject.cas}\n${cacheObject.value}\n`
            }
        }
        response += "END"
        //Send it to the client
        socket.send(response)
    }

}

