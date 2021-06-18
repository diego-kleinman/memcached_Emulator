const Client = require("socket.io-client")

//**************************************TESTING VALUES VALIDATION PROCCESING **********************************************/

describe("Testing proccesing of values", () => {

    test("Input '\\n' with bytes = 0 should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket9 = new Client(`http://localhost:${3000}`)
        clientSocket9.on('connect', () => { })
        clientSocket9.on('message', (data) => {
            messageRecieved = data
            clientSocket9.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket9.emit('message', 'set diego 2 0 0')
        clientSocket9.emit('message', '\n')
    })

    test("Input length > bytes defined should return CLIENT_ERROR bad data chunk", (done) => {
        let messageRecieved = ""
        clientSocket10 = new Client(`http://localhost:${3000}`)
        clientSocket10.on('connect', () => { })
        clientSocket10.on('message', (data) => {
            messageRecieved = data
            clientSocket10.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad data chunk")
            done()
        })
        clientSocket10.emit('message', 'set diego 2 2 2')
        clientSocket10.emit('message', 'abc')
    })

    test("Input length > bytes defined (In two different inputs combined) should return CLIENT_ERROR bad data chunk", (done) => {
        let messageRecieved = ""
        clientSocket11 = new Client(`http://localhost:${3000}`)
        clientSocket11.on('connect', () => { })
        clientSocket11.on('message', (data) => {
            messageRecieved = data
            clientSocket11.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad data chunk")
            done()
        })
        clientSocket11.emit('message', 'set diego 2 2 2')
        clientSocket11.emit('message', 'a')
        clientSocket11.emit('message', 'bc')
    })

    test("Input length === bytes defined should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket12 = new Client(`http://localhost:${3000}`)
        clientSocket12.on('connect', () => { })
        clientSocket12.on('message', (data) => {
            messageRecieved = data
            clientSocket12.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket12.emit('message', 'set diego 2 0 2')
        clientSocket12.emit('message', 'ab')
    })

    test("Input length === bytes (In two different inputs combined) defined should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket13 = new Client(`http://localhost:${3000}`)
        clientSocket13.on('connect', () => { })
        clientSocket13.on('message', (data) => {
            messageRecieved = data
            clientSocket13.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket13.emit('message', 'set diego 2 0 2')
        clientSocket13.emit('message', 'a')
        clientSocket13.emit('message', 'b')
    })

    test("Input '\\n' and '\\n' with bytes = 2 should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket14 = new Client(`http://localhost:${3000}`)
        clientSocket14.on('connect', () => { })
        clientSocket14.on('message', (data) => {
            messageRecieved = data
            clientSocket14.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket14.emit('message', 'set diego 2 0 2')
        clientSocket14.emit('message', '\n')
        clientSocket14.emit('message', '\n')
    })
})

//**************************************TESTING FUNCTIONS **********************************************/

describe("Testing set and get function", () => {
    test("Correct command and value should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket15 = new Client(`http://localhost:${3000}`)
        clientSocket15.on('connect', () => { })
        clientSocket15.on('message', (data) => {
            messageRecieved = data
            clientSocket15.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket15.emit('message', 'set diego 2 0 2')
        clientSocket15.emit('message', 'ab')
    })

    test("Correct command and value should return STORED (second value stored)", (done) => {
        let messageRecieved = ""
        clientSocket16 = new Client(`http://localhost:${3000}`)
        clientSocket16.on('connect', () => { })
        clientSocket16.on('message', (data) => {
            messageRecieved = data
            clientSocket16.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket16.emit('message', 'set fede 2 0 3')
        clientSocket16.emit('message', 'abc')
    })

    test("Get data should return data from cache", (done) => {
        let messageRecieved = ""
        clientSocket17 = new Client(`http://localhost:${3000}`)
        clientSocket17.on('connect', () => { })
        clientSocket17.on('message', (data) => {
            messageRecieved = data
            clientSocket17.close()
            expect(messageRecieved).toBe("VALUE diego 2 2\nab\nEND")
            done()
        })
        clientSocket17.emit('message', 'get diego')
    })

    test("Get multiple data (including data not in cache) should return data from cache", (done) => {
        let messageRecieved = ""
        clientSocket18 = new Client(`http://localhost:${3000}`)
        clientSocket18.on('connect', () => { })
        clientSocket18.on('message', (data) => {
            messageRecieved = data
            clientSocket18.close()
            expect(messageRecieved).toBe("VALUE diego 2 2\nab\nVALUE fede 2 3\nabc\nEND")
            done()
        })
        clientSocket18.emit('message', 'get diego pepe fede')
    })

    test("Set data already in cache", (done) => {
        let messageRecieved = ""
        clientSocket19 = new Client(`http://localhost:${3000}`)
        clientSocket19.on('connect', () => { })
        clientSocket19.on('message', (data) => {
            messageRecieved = data
            clientSocket19.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket19.emit('message', 'set diego 3 0 3')
        clientSocket19.emit('message', 'abc')
    })

    test("Get data should return data from cache (changed in previous set)", (done) => {
        let messageRecieved = ""
        clientSocket20 = new Client(`http://localhost:${3000}`)
        clientSocket20.on('connect', () => { })
        clientSocket20.on('message', (data) => {
            messageRecieved = data
            clientSocket20.close()
            expect(messageRecieved).toBe("VALUE diego 3 3\nabc\nEND")
            done()
        })
        clientSocket20.emit('message', 'get diego')
    })

    test("Set with exptime <0 doesn't go to cache", (done) => {
        let messageRecieved = ""
        clientSocket21 = new Client(`http://localhost:${3000}`)
        clientSocket21.on('connect', () => { })
        clientSocket21.on('message', (data) => {
            messageRecieved = data
            clientSocket21.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket21.emit('message', 'set testing 3 -3 3')
        clientSocket21.emit('message', 'abc')
    })

    test("Get data should return nothing", (done) => {
        let messageRecieved = ""
        clientSocket22 = new Client(`http://localhost:${3000}`)
        clientSocket22.on('connect', () => { })
        clientSocket22.on('message', (data) => {
            messageRecieved = data
            clientSocket22.close()
            expect(messageRecieved).toBe("END")
            done()
        })
        clientSocket22.emit('message', 'get testing')
    })

    test("Correct command and value(In two different inputs) should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket23 = new Client(`http://localhost:${3000}`)
        clientSocket23.on('connect', () => { })
        clientSocket23.on('message', (data) => {
            messageRecieved = data
            clientSocket23.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket23.emit('message', 'set juan 2 0 4')
        clientSocket23.emit('message', 'te')
        clientSocket23.emit('message', 'st')
    })

    test("Get data should return data from cache (inserted in previous set)", (done) => {
        let messageRecieved = ""
        clientSocket24 = new Client(`http://localhost:${3000}`)
        clientSocket24.on('connect', () => { })
        clientSocket24.on('message', (data) => {
            messageRecieved = data
            clientSocket24.close()
            expect(messageRecieved).toBe("VALUE juan 2 4\ntest\nEND")
            done()
        })
        clientSocket24.emit('message', 'get juan')
    })
})

describe("Testing add function", () => {

     test("Attempting to add a value already stored should return NOT_STORED", (done) => {
        let messageRecieved = ""
        clientSocket25 = new Client(`http://localhost:${3000}`)
        clientSocket25.on('connect', () => { })
        clientSocket25.on('message', (data) => {
            messageRecieved = data
            clientSocket25.close()
            expect(messageRecieved).toBe("NOT_STORED")
            done()
        })
        clientSocket25.emit('message', 'add diego 2 0 2')
        clientSocket25.emit('message', 'ab')
    })

    test("Attempting to add a value not already stored should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket26 = new Client(`http://localhost:${3000}`)
        clientSocket26.on('connect', () => { })
        clientSocket26.on('message', (data) => {
            messageRecieved = data
            clientSocket26.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket26.emit('message', 'add diegoKleinman 2 0 2')
        clientSocket26.emit('message', 'ab')
    })

    test("Trying to get the value added should return it", (done) => {
        let messageRecieved = ""
        clientSocket27 = new Client(`http://localhost:${3000}`)
        clientSocket27.on('connect', () => { })
        clientSocket27.on('message', (data) => {
            messageRecieved = data
            clientSocket27.close()
            expect(messageRecieved).toBe("VALUE diegoKleinman 2 2\nab\nEND")
            done()
        })
        clientSocket27.emit('message', 'get diegoKleinman')
    })
})

describe("Testing replace function", () => {

    test("Attempting to replace a value not already stored should return NOT_STORED", (done) => {
        let messageRecieved = ""
        clientSocket28 = new Client(`http://localhost:${3000}`)
        clientSocket28.on('connect', () => { })
        clientSocket28.on('message', (data) => {
            messageRecieved = data
            clientSocket28.close()
            expect(messageRecieved).toBe("NOT_STORED")
            done()
        })
        clientSocket28.emit('message', 'replace maximiliano 2 0 2')
        clientSocket28.emit('message', 'ab')
    })

    test("Attempting to replace a value already stored should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket29 = new Client(`http://localhost:${3000}`)
        clientSocket29.on('connect', () => { })
        clientSocket29.on('message', (data) => {
            messageRecieved = data
            clientSocket29.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket29.emit('message', 'replace diego 2 0 2')
        clientSocket29.emit('message', 'ef')
    })

    test("Trying to get the value replaced should return it", (done) => {
        let messageRecieved = ""
        clientSocket30 = new Client(`http://localhost:${3000}`)
        clientSocket30.on('connect', () => { })
        clientSocket30.on('message', (data) => {
            messageRecieved = data
            clientSocket30.close()
            expect(messageRecieved).toBe("VALUE diego 2 2\nef\nEND")
            done()
        })
        clientSocket30.emit('message', 'get diego')
    })

})

describe("Testing append function", () => {

    test("Attempting to append a value to an object not already stored should return NOT_STORED", (done) => {
        let messageRecieved = ""
        clientSocket31 = new Client(`http://localhost:${3000}`)
        clientSocket31.on('connect', () => { })
        clientSocket31.on('message', (data) => {
            messageRecieved = data
            clientSocket31.close()
            expect(messageRecieved).toBe("NOT_STORED")
            done()
        })
        clientSocket31.emit('message', 'append testing2 2 0 2')
        clientSocket31.emit('message', 'ab')
    })

    test("Appending a value to an object already stored should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket32 = new Client(`http://localhost:${3000}`)
        clientSocket32.on('connect', () => { })
        clientSocket32.on('message', (data) => {
            messageRecieved = data
            clientSocket32.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket32.emit('message', 'append diego 2 0 2')
        clientSocket32.emit('message', 'ab')
    })

    test("Trying to get the value appended should return it", (done) => {
        let messageRecieved = ""
        clientSocket33 = new Client(`http://localhost:${3000}`)
        clientSocket33.on('connect', () => { })
        clientSocket33.on('message', (data) => {
            messageRecieved = data
            clientSocket33.close()
            expect(messageRecieved).toBe("VALUE diego 2 4\nefab\nEND")
            done()
        })
        clientSocket33.emit('message', 'get diego')
    })

})

describe("Testing prepend function", () => {

    test("Attempting to prepend a value to an object not already stored should return NOT_STORED", (done) => {
        let messageRecieved = ""
        clientSocket34 = new Client(`http://localhost:${3000}`)
        clientSocket34.on('connect', () => { })
        clientSocket34.on('message', (data) => {
            messageRecieved = data
            clientSocket34.close()
            expect(messageRecieved).toBe("NOT_STORED")
            done()
        })
        clientSocket34.emit('message', 'prepend testing2 2 0 2')
        clientSocket34.emit('message', 'ab')
    })

    test("Prepending a value to an object already stored should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket35 = new Client(`http://localhost:${3000}`)
        clientSocket35.on('connect', () => { })
        clientSocket35.on('message', (data) => {
            messageRecieved = data
            clientSocket35.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket35.emit('message', 'prepend diego 2 0 2')
        clientSocket35.emit('message', 'cc')
    })

    test("Trying to get the value appended should return it", (done) => {
        let messageRecieved = ""
        clientSocket36 = new Client(`http://localhost:${3000}`)
        clientSocket36.on('connect', () => { })
        clientSocket36.on('message', (data) => {
            messageRecieved = data
            clientSocket36.close()
            expect(messageRecieved).toBe("VALUE diego 2 6\nccefab\nEND")
            done()
        })
        clientSocket36.emit('message', 'get diego')
    })

})

describe("Testing cas and gets function", () => {
    
    test("Attempting to cas a value with the wrong cas parameter should return EXISTS", (done) => {
        let messageRecieved = ""
        clientSocket37 = new Client(`http://localhost:${3000}`)
        clientSocket37.on('connect', () => { })
        clientSocket37.on('message', (data) => {
            messageRecieved = data
            clientSocket37.close()
            expect(messageRecieved).toBe("EXISTS")
            done()
        })
        clientSocket37.emit('message', 'cas diego 2 0 2 5')
        clientSocket37.emit('message', 'cc')
    })

    test("Attempting to cas a value not already stored should return NOT_FOUND", (done) => {
        let messageRecieved = ""
        clientSocket38 = new Client(`http://localhost:${3000}`)
        clientSocket38.on('connect', () => { })
        clientSocket38.on('message', (data) => {
            messageRecieved = data
            clientSocket38.close()
            expect(messageRecieved).toBe("NOT_FOUND")
            done()
        })
        clientSocket38.emit('message', 'cas ldsanln 2 0 2 5')
        clientSocket38.emit('message', 'cc')
    })

    test("Attempting to cas an object already stored with the correct cas parameter should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket39 = new Client(`http://localhost:${3000}`)
        clientSocket39.on('connect', () => { })
        clientSocket39.on('message', (data) => {
            messageRecieved = data
            clientSocket39.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket39.emit('message', 'cas diego 2 0 2 12')
        clientSocket39.emit('message', 'cc')
    })
    
    test("Trying to gets the value should return it", (done) => {
        let messageRecieved = ""
        clientSocket40 = new Client(`http://localhost:${3000}`)
        clientSocket40.on('connect', () => { })
        clientSocket40.on('message', (data) => {
            messageRecieved = data
            clientSocket40.close()
            expect(messageRecieved).toBe("VALUE diego 2 2 13\ncc\nEND")
            done()
        })
        clientSocket40.emit('message', 'gets diego')
    })

})


