const { setFunction, addFunction, prependFunction, appendFunction, casFunction, getFunction, getsFunction, replaceFunction } = require('../Src/functions')

//I have to set global cas and cache in order for functions to execute correctly
global.currentCas = 1

global.cache = {}


describe("Testing set and get functions", () => {

    test("Correct command and value should return STORED", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ab'
        expect(setFunction(commandLine, value)).toBe("STORED")
    })

    test("Correct command and value should return STORED (second value stored)", () => {
        const commandLine = {
            'key': 'fede',
            'flags': '2',
            'exptime': 0,
            'bytes': 3
        }
        const value = 'abc'
        expect(setFunction(commandLine, value)).toBe("STORED")
    })

    test("Get data stored should return it correctly", () => {
        expect(getFunction(['get', 'diego'])).toBe("VALUE diego 2 2\nab\nEND")
    })

    test("Get multiple data (including data not in cache) should return it correctly", () => {
        expect(getFunction(['get', 'diego', 'pepe', 'fede'])).toBe("VALUE diego 2 2\nab\nVALUE fede 2 3\nabc\nEND")
    })

    test("Set value already stored should return STORED", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '3',
            'exptime': 0,
            'bytes': 3
        }
        const value = 'abc'
        expect(setFunction(commandLine, value)).toBe("STORED")
    })

    test("Get data stored should return it correctly", () => {
        expect(getFunction(['get', 'diego'])).toBe("VALUE diego 3 3\nabc\nEND")
    })

    test("Set value with exptime < 0 shouldn't store it in cache", () => {
        const commandLine = {
            'key': 'test',
            'flags': '3',
            'exptime': -2,
            'bytes': 3
        }
        const value = 'abc'
        setFunction(commandLine, value)
        expect(getFunction(['get', 'test'])).toBe("END")
    })

})

describe("Testing add function", () => {

    test("Attempting to add a value already stored should return NOT_STORED", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ab'
        expect(addFunction(commandLine, value)).toBe("NOT_STORED")
    })

    test("Attempting to add a value not already stored should return STORED", () => {
        const commandLine = {
            'key': 'diegoKleinman',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ab'
        expect(addFunction(commandLine, value)).toBe("STORED")
    })

    test("Get data stored should return it correctly", () => {
        expect(getFunction(['get', 'diegoKleinman'])).toBe("VALUE diegoKleinman 2 2\nab\nEND")
    })
})

describe("Testing replace function", () => {

    test("Attempting to replace a value not already stored should return NOT_STORED", () => {
        const commandLine = {
            'key': 'maximiliano',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ab'
        expect(replaceFunction(commandLine, value)).toBe("NOT_STORED")
    })

    test("Attempting to replace a value already stored should return STORED", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ef'
        expect(replaceFunction(commandLine, value)).toBe("STORED")
    })

    test("Get data stored should return it correctly", () => {
        expect(getFunction(['get', 'diego'])).toBe("VALUE diego 2 2\nef\nEND")
    })
})

describe("Testing append function", () => {

    test("Attempting to append a value to an object not already stored should return NOT_STORED", () => {
        const commandLine = {
            'key': 'testing',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ab'
        expect(appendFunction(commandLine,value)).toBe("NOT_STORED")
    })

    test("Appending a value to an object already stored should return STORED", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ab'
        expect(appendFunction(commandLine,value)).toBe("STORED")
    })

    test("Get data stored should return it correctly", () => {
        expect(getFunction(['get', 'diego'])).toBe("VALUE diego 2 4\nefab\nEND")
    })

})

describe("Testing prepend function", () => {

    test("Attempting to prepend a value to an object not already stored should return NOT_STORED", () => {
        const commandLine = {
            'key': 'testing2',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'ab'
        expect(prependFunction(commandLine,value)).toBe("NOT_STORED")
    })

    test("Prepending a value to an object already stored should return STORED", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': 0,
            'bytes': 2
        }
        const value = 'cc'
        expect(prependFunction(commandLine,value)).toBe("STORED")
    })

    test("Get data stored should return it correctly", () => {
        expect(getFunction(['get', 'diego'])).toBe("VALUE diego 2 6\nccefab\nEND")
    })

})

describe("Testing cas and gets function", () => {
    
    test("Attempting to cas a value with the wrong cas parameter should return EXISTS", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': 0,
            'bytes': 2,
            'cas': 5
        }
        const value = 'cc'
        expect(casFunction(commandLine,value)).toBe("EXISTS")
    })

    test("Attempting to cas a value not already stored should return NOT_FOUND", () => {
        const commandLine = {
            'key': 'ldsanln',
            'flags': '2',
            'exptime': 0,
            'bytes': 2,
            'cas': 5
        }
        const value = 'cc'
        expect(casFunction(commandLine,value)).toBe("NOT_FOUND")
    })

    test("Attempting to cas an object already stored with the correct cas parameter should return STORED", () => {
        const commandLine = {
            'key': 'diego',
            'flags': '2',
            'exptime': 0,
            'bytes': 2,
            'cas': 7
        }
        const value = 'cc'       
        expect(casFunction(commandLine,value)).toBe("STORED")
    })
    
    test("Gets data stored should return it correctly", () => {
        expect(getsFunction(['gets', 'diego'])).toBe("VALUE diego 2 2 8\ncc\nEND")
    })
})