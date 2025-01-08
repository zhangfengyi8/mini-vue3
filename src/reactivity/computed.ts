import { ReactiveEffect } from "./effect"

class ComputedRefImpl {
    private _getter: any
    private _dirty: boolean = true
    private _value: any
    private _effect: any

    constructor(getter) {
        this._getter = getter
        this._effect = new ReactiveEffect(getter, () => {
            this._dirty = true
        })
    }

    get value() {
        //当依赖的响应式对象发生改变时，_dirty为true，重新计算value
        if(this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter) 
}