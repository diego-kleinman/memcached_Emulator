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



