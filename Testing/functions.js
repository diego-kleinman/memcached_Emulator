const { setFunction, addFunction, prependFunction, appendFunction, casFunction, replace, getFunction, getsFunction} = require('../Src/functions')

describe("Testing functions", () => {

    //I have to set local cas and cache in order for functions to execute correctly
    currentCas = 1
    cache = {
        'diego':{
            'value': 'ab',
            'flags': '2',
            'exptime': 0,
            'bytes': 2,
            'cas':1,
        }
    }

    test("Correct command and value should return STORED", () => {

        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': '0',
            'bytes': '2'
        }
        const value = 'ab'
        expect(setFunction(commandLine, value)).toBe("STORED")
    })

    test("Correct command and value should return STORED (second value stored)", () => {

        const commandLine = {
            'key': 'fede',
            'flags': '2',
            'exptime': '0',
            'bytes': '3'
        }
        const value = 'abc'
        expect(setFunction(commandLine, value)).toBe("STORED")
    })


    // test("Get data should return data from cache (changed in previous set)", (done) => {
    //     let messageRecieved = ""
    //     clientSocket20 = new Client(`http://localhost:${3000}`)
    //     clientSocket20.on('connect', () => { })
    //     clientSocket20.on('message', (data) => {
    //         messageRecieved = data
    //         clientSocket20.close()
    //         expect(messageRecieved).toBe("VALUE diego 3 3\nabc\nEND")
    //         done()
    //     })
    //     clientSocket20.emit('message', 'get diego')
    // })

    // test("Set with exptime <0 doesn't go to cache", (done) => {
    //     let messageRecieved = ""
    //     clientSocket21 = new Client(`http://localhost:${3000}`)
    //     clientSocket21.on('connect', () => { })
    //     clientSocket21.on('message', (data) => {
    //         messageRecieved = data
    //         clientSocket21.close()
    //         expect(messageRecieved).toBe("STORED")
    //         done()
    //     })
    //     clientSocket21.emit('message', 'set testing 3 -3 3')
    //     clientSocket21.emit('message', 'abc')
    // })

    // test("Get data should return nothing", (done) => {
    //     let messageRecieved = ""
    //     clientSocket22 = new Client(`http://localhost:${3000}`)
    //     clientSocket22.on('connect', () => { })
    //     clientSocket22.on('message', (data) => {
    //         messageRecieved = data
    //         clientSocket22.close()
    //         expect(messageRecieved).toBe("END")
    //         done()
    //     })
    //     clientSocket22.emit('message', 'get testing')
    // })

    // test("Correct command and value(In two different inputs) should return STORED", (done) => {
    //     let messageRecieved = ""
    //     clientSocket23 = new Client(`http://localhost:${3000}`)
    //     clientSocket23.on('connect', () => { })
    //     clientSocket23.on('message', (data) => {
    //         messageRecieved = data
    //         clientSocket23.close()
    //         expect(messageRecieved).toBe("STORED")
    //         done()
    //     })
    //     clientSocket23.emit('message', 'set juan 2 0 4')
    //     clientSocket23.emit('message', 'te')
    //     clientSocket23.emit('message', 'st')
    // })

    // test("Get data should return data from cache (inserted in previous set)", (done) => {
    //     let messageRecieved = ""
    //     clientSocket24 = new Client(`http://localhost:${3000}`)
    //     clientSocket24.on('connect', () => { })
    //     clientSocket24.on('message', (data) => {
    //         messageRecieved = data
    //         clientSocket24.close()
    //         expect(messageRecieved).toBe("VALUE juan 2 4\ntest\nEND")
    //         done()
    //     })
    //     clientSocket24.emit('message', 'get juan')
    // })



})