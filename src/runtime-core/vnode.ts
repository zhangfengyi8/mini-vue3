import { ShapeFlags } from "../shared/shapeFlags"

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export function createVNode(type, props?, children?) {
    const vnode = { 
        type, 
        props, 
        children,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    //children
    if(typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if(Array.isArray(children)){
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if(typeof children === "object") {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
        }
    }

    return vnode
}

export function createTextVNode(text:string) {
    return createVNode(Text, {}, text)
}

function getShapeFlag(type: any) {
    return typeof type === "string" 
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT
}
