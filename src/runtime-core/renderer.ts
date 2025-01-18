import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function renderer(vnode, container) {
    //patch
    patch(vnode, container)
}

function patch(vnode, container) {
    //判断vnode是不是element或component
    //是element 就该处理element
    const { type, shapeFlag } = vnode || {}

    //Fragment -> 只渲染children
    switch (type) {
        case Fragment: 
            processFragment(vnode, container)
            break
        case Text:
            processText(vnode, container)
            break
        default:
            if(shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                //处理组件
                processComponent(vnode, container)
            }
            break
    }
}

function processText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}

function processFragment(vnode: any, container:any) {
    mountChildren(vnode, container)
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = (vnode.el = document.createElement(vnode.type))
    //string array
    const { children, props, shapeFlag } = vnode

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        //text_children
        el.textContent = children
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //array_children
       mountChildren(vnode, el)
    }
    // console.log(props)
    //props
    for (const key in props) {
        const val = props[key]
        //判断是否是注册事件
        const isOn = (key:string) => /^on[A-Z]/.test(key)
        if(isOn(key)) {
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }

    container.append(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach(element => {
        patch(element, container)
    });
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(initialVnode: any, container: any) {
    const instance = createComponentInstance(initialVnode)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance:any, initialVnode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    
    //vnode -> patch
    //vnode -> element

    patch(subTree, container)

    //element -> mount
    initialVnode.el = subTree.el
}

