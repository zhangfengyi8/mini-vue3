import { readonly, isReadOnly, isReactive } from '../reactive'

describe('readonly', () => {
    it('happy path', () => {
        //not set
        const original = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)

        //isReadOnly
        expect(isReadOnly(wrapped)).toBe(true)
        expect(isReadOnly(original)).toBe(false)

        expect(isReadOnly(wrapped.bar)).toBe(true)
        expect(isReadOnly(original.bar)).toBe(false)
        expect(wrapped.foo).toBe(1)
    })

    it('warn the call set', () => {
        console.warn = jest.fn()
        const user = readonly({ age: 10 })
        user.age = 11
        expect(console.warn).toBeCalled()
    })

})