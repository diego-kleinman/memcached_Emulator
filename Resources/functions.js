/**
 * Variable that represents the current cas value being used by the server
 * 
 * This value updates everytime a storage function executes
 */
//  let currentCas = 1

//  /**
//   * Js object that represents "key : value" pairs currently stored in the server
//   * 
//   * For example --> "test" : { value = "ab", flags = 2, exptime = 0 , bytes = 2 ,cas = 2 }
//   */
//  const cache = {
//  }

module.exports = {
    /**
     * This function represents the "cas" function from memcached
     * @param {string} commandLine Command client has put
     * @param {string} value Value client has put
     */
    casFunction: (commandLine, value) => {
        const { key, flags, exptime, bytes, cas } = commandLine
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
        //If key is already in cache, append value
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
        //If key is already in cache, prepend value
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

        //If key isn't in cache
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

        //If key is in cache
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
    flushFunction: (socket) => {
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
        //Go over all the keys that client want's to get, generate a response matching memcached protocol
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
        //Go over all the keys that client want's to get, generate a response matching memcached protocol
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
        const cas = currentCas
        cache[key] = { value, flags, exptime, bytes, cas }
        currentCas++
    }
}