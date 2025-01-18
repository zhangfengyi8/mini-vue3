import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement, patchProp, insert } = options

    function renderer(vnode, container) {
        //patch
        patch(vnode, container, null)
    }

    function patch(vnode, container, parentComponent) {
        //判断vnode是不是element或component
        //是element 就该处理element
        const { type, shapeFlag } = vnode || {}
    
        //Fragment -> 只渲染children
        switch (type) {
            case Fragment: 
                processFragment(vnode, container, parentComponent)
                break
            case Text:
                processText(vnode, container)
                break
            default:
                if(shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    //处理组件
                    processComponent(vnode, container, parentComponent)
                }
                break
        }
    }
    
    function processText(vnode: any, container: any) {
        const { children } = vnode
        const textNode = (vnode.el = document.createTextNode(children))
        container.append(textNode)
    }
    
    function processFragment(vnode: any, container:any, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }
    
    function processElement(vnode: any, container: any, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }
    
    //虚拟节点渲染成真实节点
    function mountElement(vnode: any, container: any, parentComponent) {
        //canvas
        //new Element()
        const el = (vnode.el = createElement(vnode.type))
        //string array
        const { children, props, shapeFlag } = vnode
    
        if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            //text_children
            el.textContent = children
        } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            //array_children
           mountChildren(vnode, el, parentComponent)
        }
        //console.log(props)
        //props
        for (const key in props) {
            const val = props[key]
            //判断是否是注册事件
            // const isOn = (key:string) => /^on[A-Z]/.test(key)
            // if(isOn(key)) {
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val)
            // }
            patchProp(el, key, val)
        }
        //canvs
        //el.x = 10
    
        // container.append(el)
        //addChild()
        insert(el, container)
    }
    
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(element => {
            patch(element, container, parentComponent)
        });
    }
    
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }
    
    function mountComponent(initialVnode: any, container: any, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container)
    }
    
    function setupRenderEffect(instance:any, initialVnode, container) {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        
        //vnode -> patch
        //vnode -> element
    
        patch(subTree, container, instance)
    
        //element -> mount
        initialVnode.el = subTree.el
    }
    
    return {
        createApp: createAppApi(renderer)
    }
    
}


