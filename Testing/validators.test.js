const {casCommandValidator,storageCommandValidator} = require('../Src/validators')


describe("Testing command validation", () => {

    test("Splitted command length < 5 in a storage non-cas command should return false", () => {
        const data = ['set','diego','2','2']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Splitted command length > 6 in a storage non-cas command should return false", () => {
        const data = ['set','diego','2','0','2','aa','b']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Splitted command length < 5 in a cas command should return false", () => {
        const data = ['set','diego','2','2']
        expect(casCommandValidator(data)).toBe(false)
    })

    test("Splitted command length = 5 in a cas command should return false", () => {
        const data = ['set','diego','2','2','2']
        expect(casCommandValidator(data)).toBe(false)
    })

    test("Splitted command length > 7 in a cas command should return false", () => {
        const data = ['set','diego','2','2','2','ab','b','c']
        expect(casCommandValidator(data)).toBe(false)
    })

    test("Flag not integer should return false", () => {
        const data = ['set','diego','a','2','2']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Flag > 65535 should return false", () => {
        const data = ['set','diego','65540','2','2']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Bytes not integer should return false", () => {
        const data = ['set','diego','2','2','a']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Bytes < 0 should return false", () => {
        const data = ['set','diego','2','2','-3']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Bytes > 1048576 should return false", () => {
        const data = ['set','diego','2','2','1048577']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Exptime not integer should return false", () => {
        const data = ['set','diego','2','a','2']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Key length > 250 should return false", () => {
        let input = ""
        //Generate input with length > 250
        for (let i = 0; i < 26; i++) {
            input += "abcdefghij"
        }
        const data = ['set',input,'2','0','250']
        expect(storageCommandValidator(data)).toBe(false)
    })

    test("Correct storage command should return true", () => {
        const data = ['set','diego','2','0','2']
        expect(storageCommandValidator(data)).toBe(true)
    })

    test("Correct cas command should return true", () => {
        const data = ['cas','diego','2','0','2','2']
        expect(casCommandValidator(data)).toBe(true)
    })

})