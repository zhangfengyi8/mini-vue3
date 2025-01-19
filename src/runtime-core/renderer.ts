import { effect } from "../reactivity/effect"
import { EMPTY_OBJ, isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement, patchProp, insert, remove, setElementText } = options

    function renderer(vnode, container) {
        //patch
        patch(null, vnode, container, null)
    }

    //n1老的虚拟节点、n2是新虚拟节点
    function patch(n1, n2, container, parentComponent) {
        //判断vnode是不是element或component
        //是element 就该处理element
        const { type, shapeFlag } = n2 || {}

        //Fragment -> 只渲染children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    //处理组件
                    processComponent(n1, n2, container, parentComponent)
                }
                break
        }
    }

    function processText(n1, n2: any, container: any) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragment(n1, n2: any, container: any, parentComponent) {
        mountChildren(n2.children, container, parentComponent)
    }

    function processElement(n1, n2: any, container: any, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container, parentComponent)
        }
    }

    function patchElement(n1, n2, container, parentComponent) {
        console.log("patchElement")
        console.log("n1", n1)
        console.log("n2", n2)

        //n1, n2更新对比
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = (n2.el = n1.el)
        patchChildren(n1, n2, el, parentComponent)

        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, container, parentComponent) {
        const prevShapeFlag = n1.shapeFlag
        const shapeFlag = n2.shapeFlag
        const c1 = n1.children
        const c2 = n2.children

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                //1. 把老的 children 清空
                unmountChildren(n1.children)
                //2. 设置text
                setElementText(container, c2)
            } else {
                if(c1 !== c2) {
                    setElementText(container, c2)
                }
            }
        } else {
            //new Array
            if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                setElementText(container, "")
                mountChildren(c2, container, parentComponent)
            }
        }
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            //remove
            remove(el)
        }
    }

    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]

                if (prevProp !== nextProp) {
                    patchProp(el, key, prevProp, nextProp)
                }
            }

            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        patchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }


    //虚拟节点渲染成真实节点
    function mountElement(vnode: any, container: any, parentComponent) {
        //canvas
        //new Element()
        const el = (vnode.el = createElement(vnode.type))
        //string array
        const { children, props, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            //text_children
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            //array_children
            mountChildren(vnode.children, el, parentComponent)
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
            patchProp(el, key, null, val)
        }
        //canvs
        //el.x = 10

        // container.append(el)
        //addChild()
        insert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.children.forEach(element => {
            patch(null, element, container, parentComponent)
        });
    }

    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }


    function mountComponent(initialVnode: any, container: any, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container)
    }

    function setupRenderEffect(instance: any, initialVnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("init")
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))

                //vnode -> patch
                //vnode -> element
                patch(null, subTree, container, instance)

                //element -> mount
                initialVnode.el = subTree.el

                instance.isMounted = true
            } else {
                console.log("update")
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree

                patch(preSubTree, subTree, container, instance)
            }
        })
    }

    return {
        createApp: createAppApi(renderer)
    }

}


