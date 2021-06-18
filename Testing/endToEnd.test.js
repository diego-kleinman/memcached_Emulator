const Client = require("socket.io-client")

describe("Testing proccesing of values", () => {

    test("Input '\\n' with bytes = 0 should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket1 = new Client(`http://localhost:${3000}`)
        clientSocket1.on('connect', () => { })
        clientSocket1.on('message', (data) => {
            messageRecieved = data
            clientSocket1.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket1.emit('message', 'set diego 2 0 0')
        clientSocket1.emit('message', '\n')
    })

    test("Input length > bytes defined should return CLIENT_ERROR bad data chunk", (done) => {
        let messageRecieved = ""
        clientSocket2 = new Client(`http://localhost:${3000}`)
        clientSocket2.on('connect', () => { })
        clientSocket2.on('message', (data) => {
            messageRecieved = data
            clientSocket2.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad data chunk")
            done()
        })
        clientSocket2.emit('message', 'set diego 2 2 2')
        clientSocket2.emit('message', 'abc')
    })

    test("Input length > bytes defined (In two different inputs combined) should return CLIENT_ERROR bad data chunk", (done) => {
        let messageRecieved = ""
        clientSocket3 = new Client(`http://localhost:${3000}`)
        clientSocket3.on('connect', () => { })
        clientSocket3.on('message', (data) => {
            messageRecieved = data
            clientSocket3.close()
            expect(messageRecieved).toBe("CLIENT_ERROR bad data chunk")
            done()
        })
        clientSocket3.emit('message', 'set diego 2 2 2')
        clientSocket3.emit('message', 'a')
        clientSocket3.emit('message', 'bc')
    })

    test("Input length === bytes defined should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket4 = new Client(`http://localhost:${3000}`)
        clientSocket4.on('connect', () => { })
        clientSocket4.on('message', (data) => {
            messageRecieved = data
            clientSocket4.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket4.emit('message', 'set diego 2 0 2')
        clientSocket4.emit('message', 'ab')
    })

    test("Input length === bytes (In two different inputs combined) defined should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket5 = new Client(`http://localhost:${3000}`)
        clientSocket5.on('connect', () => { })
        clientSocket5.on('message', (data) => {
            messageRecieved = data
            clientSocket5.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket5.emit('message', 'set diego 2 0 2')
        clientSocket5.emit('message', 'a')
        clientSocket5.emit('message', 'b')
    })

    test("Input '\\n' and '\\n' with bytes = 2 should return STORED", (done) => {
        let messageRecieved = ""
        clientSocket6 = new Client(`http://localhost:${3000}`)
        clientSocket6.on('connect', () => { })
        clientSocket6.on('message', (data) => {
            messageRecieved = data
            clientSocket6.close()
            expect(messageRecieved).toBe("STORED")
            done()
        })
        clientSocket6.emit('message', 'set diego 2 0 2')
        clientSocket6.emit('message', '\n')
        clientSocket6.emit('message', '\n')
    })
})



