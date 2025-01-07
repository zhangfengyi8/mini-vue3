import { extend } from "../shared"


let activeEffect
let shouldTrack

//effect就是依赖
class ReactiveEffect {
    private _fn: any
    deps = []
    active = true

    constructor(fn, public scheduler?) {
        this._fn = fn
    }

    run() {
        if (!this.active) {
            return this._fn()
        }
        shouldTrack = true
        activeEffect = this

        const result = this._fn()
        shouldTrack = false

        return result
    }

    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }

    onStop?: () => void
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

const targetMap = new Map()
export function track(target, key) {
    // target -> key -> map
    //1. 先从map中拿到目标对象
    let depsMap = targetMap.get(target)

    //初始化
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    trackEffects(dep)
}

export function trackEffects(dep) {
    if (!activeEffect) return
    if (!shouldTrack) return
    
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)

    triggerEffects(dep)
}

export function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)

    // _effect.onStop = options.onStop
    extend(_effect, options)

    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}

export function stop(runner) {
    runner.effect.stop()
}