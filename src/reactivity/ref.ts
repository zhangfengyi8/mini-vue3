import { hasChanged, isObject } from "../shared";
import { trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any;
    private _rawValue: any;
    public dep;
    public __v_isRef = true;

    constructor(value) {
        this._rawValue = value;
        //看value是不是对象，是的话用reactive包裹一下
        this._value = isObject(value) ? reactive(value) : value;
        this.dep = new Set();
    }

    get value() {
        trackEffects(this.dep);
        return this._value;
    }

    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) return;

        this._rawValue = newValue;
        this._value = isObject(newValue) ? reactive(newValue) : newValue;
        triggerEffects(this.dep);
    }
}

export function ref(value: any) {
    return new RefImpl(value);
}

export function isRef(ref) {
    return !!ref.__v_isRef
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}