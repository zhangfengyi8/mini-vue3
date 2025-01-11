import { track, trigger } from "./effect"
import { isObject } from "../shared/index"

function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        if(key === ReactiveFlags.IS_REACTIVE) {
            return !isReadOnly
        } else if(key === ReactiveFlags.IS_READONLY) { 
            return isReadOnly
        }

        const res = Reflect.get(target, key)

        if (shallow) return res

        if(isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res)
        }
        
        if (!isReadOnly) {
            // 依赖收集
            track(target, key)
        }
        return res
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
    return new Proxy(raw, {
        get: createGetter(),
        set: createSetter()
    })
}

//深只读
export function readonly(raw) {
    return new Proxy(raw, {
        get: createGetter(true),
        set(target, key, value) {
            console.warn('readonly')
            return true
        }
    })
} 

//浅只读
export function shallowReadonly(raw) {
    if(!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`)
        return raw
    } else {
        return new Proxy(raw, {
            get: createGetter(true, true),
            set(target, key, value) {
                console.warn('shallowReadonly')
                return true
            }
        })
    }
}

export function isReactive(target) {
    return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadOnly(target) {
    return !!target[ReactiveFlags.IS_READONLY]
}     

export function isProxy(target) {
    return isReactive(target) || isReadOnly(target)
}

