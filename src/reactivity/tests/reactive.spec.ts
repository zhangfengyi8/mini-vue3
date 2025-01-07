import { reactive, isReactive, isProxy } from "../reactive"
 
describe('effect', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)        
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)

        //isReactive
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)

        //isProxy
        expect(isProxy(observed)).toBe(true)
        expect(isProxy(original)).toBe(false)
    })

    //嵌套对象转换测试
    it('nested reactive', () => {                   
        const original = {
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        }

        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    }) 
})