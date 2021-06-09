const Client = require("socket.io-client")

describe("Testing set and get function", () => {

    test("Correct command and value should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket1 = new Client(`http://localhost:${3000}`)
        clientSocket1.on('connect', () => { })
        clientSocket1.on('message', (data) => {
            messageRecieved = data
            clientSocket1.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket1.emit('message', 'set diego 2 2 2')
        clientSocket1.emit('message', 'ab')
    })

    test("Correct command and value should return STORED (second value stored)", (done) => {
        let messageRecieved = ""
        clientSocket2 = new Client(`http://localhost:${3000}`)
        clientSocket2.on('connect', () => { })
        clientSocket2.on('message', (data) => {
            messageRecieved = data
            clientSocket2.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket2.emit('message', 'set fede 2 2 3')
        clientSocket2.emit('message', 'abc')
    })

    test("Get data should return data from cache", (done) => {
        let messageRecieved = ""
        clientSocket3 = new Client(`http://localhost:${3000}`)
        clientSocket3.on('connect', () => { })
        clientSocket3.on('message', (data) => {
            messageRecieved = data
            clientSocket3.close()
            expect(messageRecieved).toBe("VALUE diego 2 2\nab\nEND")
            done()
        })
        clientSocket3.emit('message', 'get diego')
    })

    test("Get multiple data (including data not in cache) should return data from cache", (done) => {
        let messageRecieved = ""
        clientSocket4 = new Client(`http://localhost:${3000}`)
        clientSocket4.on('connect', () => { })
        clientSocket4.on('message', (data) => {
            messageRecieved = data
            expect(messageRecieved).toBe("VALUE diego 2 2\nab\nVALUE fede 2 3\nabc\nEND")
            clientSocket4.close()
            done()
        })
        clientSocket4.emit('message', 'get diego pepe fede')
    })

    test("Set data already in cache", (done) => {
        let messageRecieved = ""
        clientSocket5 = new Client(`http://localhost:${3000}`)
        clientSocket5.on('connect', () => { })
        clientSocket5.on('message', (data) => {
            messageRecieved = data
            expect(messageRecieved).toBe("STORED")
            clientSocket5.close()
            done()
        })
        clientSocket5.emit('message', 'set diego 3 2 3')
        clientSocket5.emit('message', 'abc')
    })

    test("Get data should return data from cache (changed in previous set)", (done) => {
        let messageRecieved = ""
        clientSocket6 = new Client(`http://localhost:${3000}`)
        clientSocket6.on('connect', () => { })
        clientSocket6.on('message', (data) => {
            messageRecieved = data
            clientSocket6.close()
            expect(messageRecieved).toBe("VALUE diego 3 3\nabc\nEND")
            done()
        })
        clientSocket6.emit('message', 'get diego')
    })

    test("Set with exptime <0 doesn't go to cache", (done) => {
        let messageRecieved = ""
        clientSocket7 = new Client(`http://localhost:${3000}`)
        clientSocket7.on('connect', () => { })
        clientSocket7.on('message', (data) => {
            messageRecieved = data
            expect(messageRecieved).toBe("STORED")
            clientSocket7.close()
            done()
        })
        clientSocket7.emit('message', 'set testing 3 -3 3')
        clientSocket7.emit('message', 'abc')
    })

    test("Get data should return nothing", (done) => {
        let messageRecieved = ""
        clientSocket8 = new Client(`http://localhost:${3000}`)
        clientSocket8.on('connect', () => { })
        clientSocket8.on('message', (data) => {
            messageRecieved = data
            clientSocket8.close()
            expect(messageRecieved).toBe("END")
            done()
        })
        clientSocket8.emit('message', 'get testing')
    })

    test("Correct command and value should return STORED (In two different inputs)", (done) => {
        let messageRecieved = ""
        clientSocket9 = new Client(`http://localhost:${3000}`)
        clientSocket9.on('connect', () => { })
        clientSocket9.on('message', (data) => {
            messageRecieved = data
            expect(messageRecieved).toBe("STORED")
            clientSocket9.close()
            done()
        })
        clientSocket9.emit('message', 'set juan 2 2 4')
        clientSocket9.emit('message', 'te')
        clientSocket9.emit('message', 'st')
    })

    test("Get data should return data from cache (inserted in previous set)", (done) => {
        let messageRecieved = ""
        clientSocket10 = new Client(`http://localhost:${3000}`)
        clientSocket10.on('connect', () => { })
        clientSocket10.on('message', (data) => {
            messageRecieved = data
            clientSocket10.close()
            expect(messageRecieved).toBe("VALUE juan 2 4\ntest\nEND")
            done()
        })
        clientSocket10.emit('message', 'get juan')
    })
})

