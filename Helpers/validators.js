

module.exports = {
    /**
     * This function validates if a storage non-cas command is well made
     * @param {[string]} data Array containing command from client splitted by spaces
     * @returns true if command is well made ; false otherwise
     */
    storageCommandValidator: (data) => {
        //Check for command, key, flags, exptime, bytes , optional: noreply
        if (data.length === 5 || data.length === 6) {
            const key = data[1]
            const flags = data[2]
            const exptime = data[3]
            const bytes = data[4]
            return validateParameters(key, flags, bytes, exptime)
        }
        return false
    },
    /**
     * This function validates if a cas command is well made
     * @param {[string]} data Array containing command from client splitted by spaces
     * @returns true if command is well made ; false otherwise
     */
    casCommandValidator: (data) => {
        //Check for command, key, flags, exptime, bytes , cas , optional: noreply
        if (data.length > 5 && data.length <= 7) {
            const key = data[1]
            const flags = data[2]
            const exptime = data[3]
            const bytes = data[4]
            const cas = data[5]

            // Check cas integer
            if ((cas % cas) !== 0 && parseInt(cas) !== 0) {
                return false
            }
            return validateParameters(key, flags, bytes, exptime)
        }
        return false
    }

}

/**
 * This function validates parameters in a command input
 * @param {string} key Key parameter
 * @param {string} flags Flags parameter
 * @param {string} bytes Bytes parameter
 * @param {string} exptime Exptime parameter
 * @returns true if parameters are valid, false otherwise
 */
const validateParameters = (key, flags, bytes, exptime) => {
    //check max length of key
    if (key.length > 250) {
        return false
    }
    //Check flags 16 bits unsigned integer
    else if ((flags % flags) !== 0 && parseInt(flags) !== 0 || parseInt(flags) > 65535) {
        return false
    }
    //Check bytes integer // bytes less than max storage possible (1MB -- 1048576 bytes) // bytes not negative
    else if ((bytes % bytes) !== 0 && parseInt(bytes) !== 0 || parseInt(bytes) > 1048576 || parseInt(bytes) < 0) {
        return false
    }
    // Check exptime integer
    else if ((exptime % exptime) !== 0 && parseInt(exptime) !== 0) {
        return false
    }
    //If all checks are OK
    else {
        return true
    }
}