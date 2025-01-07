import { reactive } from "../reactive"
import { effect, stop } from "../effect"

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        })

        let nextAge
        effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        user.age++
        expect(nextAge).toBe(12)
    })
    it('should return runner when call effect', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
            return "foo"
        })

        expect(foo).toBe(11)
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe("foo")
    })

    it('scheduler', () => {
        //1. 通过 effect 的第二个参数给定的一个scheduler 的fn
        //2. effect 第一次执行的时候 还会执行 fn
        //3. 当 响应式对象set update 不会执行 fn 而是执行 scheduler
        //4. 如果说当执行 runner 的时候，会再次的执行 fn
        let dummy
        let run: any
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        // 在这里将 scheduler 作为一个 option 传入 effect
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        )
        expect(scheduler).not.toHaveBeenCalled()
        // 会执行一次 effect 传入的 fn
        expect(dummy).toBe(1)
        obj.foo++
        // 有了 scheduler 之后，原来的 fn 就不会执行了
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        run()
        expect(dummy).toBe(2)
    })

    it("stop", () => {
        let dummy;
        const obj = reactive({ prop: 1 });
        const runner = effect(() => {
          dummy = obj.prop;
        }); 
        obj.prop = 2;
        expect(dummy).toBe(2);
        stop(runner);

        // get set
        // obj.prop++; 先进行了get, 又进行了依赖收集，所以stop清除依赖无效
        obj.prop++;
        expect(dummy).toBe(2);
    
        // stopped effect should still be manually callable
        runner();
        expect(dummy).toBe(3);
      });

      it("onStop", () => {
        const obj = reactive({
            foo: 1
        })
        const onStop = jest.fn();
        let dummy
        const runner = effect(() => {
          dummy = obj.foo
        }, {
            onStop
        });
    
        stop(runner);
        expect(onStop).toBeCalledTimes(1);
      });
})