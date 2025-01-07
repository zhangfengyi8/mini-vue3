import { isReactive, isReadOnly, readonly, shallowReadonly } from "../reactive";
describe("shallowReadonly", () => {
    //浅只读测试
    it("should not make non-reactive properties reactive", () => {
        const props = shallowReadonly({ n: { foo: 1 } });
        expect(isReadOnly(props)).toBe(true);
        expect(isReadOnly(props.n)).toBe(false);
    });

});
