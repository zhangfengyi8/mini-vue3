import { reactive } from "../reactive"
 
describe('effect', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
    })
})