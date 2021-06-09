const Client = require("socket.io-client")

//En el package tengo que ponerle para que antes de ejecutar el archivo de test ejecute el server;
//O indicarlo en el manual de usuario

describe("Testing storage command validation", () => {

    test("Flag not integer should return CLIENT_ERROR bad command line format", (done) => {
        let messageRecieved = ""
        clientSocket1 = new Client(`http://localhost:${3000}`)
        clientSocket1.on('connect', () => { })
        clientSocket1.on('message', (data) => {
            messageRecieved = data
            clientSocket1.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket1.emit('message', 'set diego a 2 2')
    })

    test("Flag > 65535 should return CLIENT_ERROR bad command line format", (done) => {
        let messageRecieved = ""
        clientSocket2 = new Client(`http://localhost:${3000}`)
        clientSocket2.on('connect', () => { })
        clientSocket2.on('message', (data) => {
            messageRecieved = data
            clientSocket2.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket2.emit('message', 'set diego 65536 2 2')
    })

    test("Bytes not integer should return CLIENT_ERROR bad command line format", (done) => {
        let messageRecieved = ""
        clientSocket3 = new Client(`http://localhost:${3000}`)
        clientSocket3.on('connect', () => { })
        clientSocket3.on('message', (data) => {
            messageRecieved = data
            clientSocket3.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket3.emit('message', 'set diego 2 2 a')
    })

    test("Bytes < 0 should return CLIENT_ERROR bad command line format", (done) => {
        let messageRecieved = ""
        clientSocket4 = new Client(`http://localhost:${3000}`)
        clientSocket4.on('connect', () => { })
        clientSocket4.on('message', (data) => {
            messageRecieved = data
            clientSocket4.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket4.emit('message', 'set diego 2 2 -3')
    })

    test("Bytes > 1048576 should return CLIENT_ERROR bad command line format", (done) => {
        let messageRecieved = ""
        clientSocket5 = new Client(`http://localhost:${3000}`)
        clientSocket5.on('connect', () => { })
        clientSocket5.on('message', (data) => {
            messageRecieved = data
            clientSocket5.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket5.emit('message', 'set diego 2 2 1048577')
    })

    test("Exptime not integer should return CLIENT_ERROR bad command line format", (done) => {
        let messageRecieved = ""
        clientSocket6 = new Client(`http://localhost:${3000}`)
        clientSocket6.on('connect', () => { })
        clientSocket6.on('message', (data) => {
            messageRecieved = data
            clientSocket6.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket6.emit('message', 'set diego 2 a 2')
    })

    test("Splitted command length < 5 should return CLIENT_ERROR bad command line format (command,key,flag,exptime,bytes)", (done) => {
        let messageRecieved = ""
        clientSocket7 = new Client(`http://localhost:${3000}`)
        clientSocket7.on('connect', () => { })
        clientSocket7.on('message', (data) => {
            messageRecieved = data
            clientSocket7.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket7.emit('message', 'set diego 2 2')
    })

    test("Key length > 250 should return CLIENT_ERROR bad command line format", (done) => {
        let input = ""
        //Generate input with length > 250
        for (let i = 0; i < 11; i++) {
            input += "abcdefghijklmnñopqrstuvwxyz"
        }
        let messageRecieved = ""
        clientSocket8 = new Client(`http://localhost:${3000}`)
        clientSocket8.on('connect', () => { })
        clientSocket8.on('message', (data) => {
            messageRecieved = data
            clientSocket8.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket8.emit('message', 'set ' + input + ' 2 2 2')
    })
})

describe("Testing proccesing of values", () => {

    test("Input '\\n' should return CLIENT_ERROR bad data chunk", (done) => {
        let messageRecieved = ""
        clientSocket9 = new Client(`http://localhost:${3000}`)
        clientSocket9.on('connect', () => { })
        clientSocket9.on('message', (data) => {
            messageRecieved = data
            clientSocket9.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad data chunk")
            done()
        })
        clientSocket9.emit('message', 'set diego 2 2 2')
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
        clientSocket12.emit('message', 'set diego 2 2 2')
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
        clientSocket13.emit('message', 'set diego 2 2 2')
        clientSocket13.emit('message', 'a')
        clientSocket13.emit('message', 'b')
    })

    test("Bytes === 0 should return CLIENT_ERROR bad command line format", (done) => {
        let messageRecieved = ""
        clientSocket14 = new Client(`http://localhost:${3000}`)
        clientSocket14.on('connect', () => { })
        clientSocket14.on('message', (data) => {
            messageRecieved = data
            clientSocket14.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad command line format")
            done()
        })
        clientSocket14.emit('message', 'set diego 2 2 0')
    })
})

