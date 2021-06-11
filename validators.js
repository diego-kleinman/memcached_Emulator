

module.exports = {
    /**
     * This function validates if a storage non-cas command is well made
     * @param {[string]} data Array containing command from client splitted by spaces
     * @returns true if command is well made ; false otherwise
     */
    storageCommandValidator: (data) => {
        //Check for command, key, flags, exptime, bytes , optional: noreply
        if (data.length === 5 || data.length === 6) {
            let key = data[1]
            let flags = data[2]
            let exptime = data[3]
            let bytes = data[4]

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
            let key = data[1]
            let flags = data[2]
            let exptime = data[3]
            let bytes = data[4]
            let casValue = data[5]

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
            // Check cas integer
            else if ((casValue % casValue) !== 0 && parseInt(casValue) !== 0) {
                return false
            }
            //If all checks are OK
            else {
                return true
            }
        }
        return false
    }

}