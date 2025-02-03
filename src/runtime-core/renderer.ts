import { effect } from "../reactivity/effect"
import { EMPTY_OBJ, isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { shouldUpdateComponent } from "./componentUpdateUtils"
import { createAppApi } from "./createApp"
import { queueJobs } from "./scheduler"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement, patchProp, insert, remove, setElementText } = options

    function renderer(vnode, container) {
        //patch
        patch(null, vnode, container, null, null)
    }

    //n1老的虚拟节点、n2是新虚拟节点
    function patch(n1, n2, container, parentComponent, anchor) {
        //判断vnode是不是element或component
        //是element 就该处理element
        const { type, shapeFlag } = n2 || {}

        //Fragment -> 只渲染children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    //处理组件
                    processComponent(n1, n2, container, parentComponent, anchor)
                }
                break
        }
    }

    function processText(n1, n2: any, container: any) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }

    function processElement(n1, n2: any, container: any, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement")
        console.log("n1", n1)
        console.log("n2", n2)

        //n1, n2更新对比
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = (n2.el = n1.el)
        patchChildren(n1, n2, el, parentComponent, anchor)

        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, container, parentComponent, anchor) {
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
                if (c1 !== c2) {
                    setElementText(container, c2)
                }
            }
        } else {
            //new Array
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                setElementText(container, "")
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                //array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    //双端对比diff算法
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0
        let e1 = c1.length - 1
        let e2 = c2.length - 1

        function isSomeVNodeType(n1, n2) {
            // type
            // key
            return n1.type === n2.type && n1.key === n2.key
        }

        //左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }

            i++
        }

        //右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }


            e1--
            e2--
        }

        //3. 新的比老的多，需要创建
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < c2.length ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            //老的比新的多，需要删除
            while (i <= e1) {
                remove(c1[i].el)
                i++
            }
        } else {
            //中间对比
            let s1 = i
            let s2 = i

            const toBePatched = e2 - s2 + 1
            let patched = 0
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

            //先将e2中间的放入映射表
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i]

                if (patched >= toBePatched) {
                    remove(prevChild.el)
                    continue
                }

                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            newIndex = j

                            break
                        }
                    }
                }

                if (newIndex === undefined) {
                    remove(prevChild.el)
                } else {

                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    patch(prevChild, c2[newIndex], container, parentComponent, null)
                    patched++
                }
            }

            //获取最长递增子序列
            const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
            let j = increasingNewIndexSequence.length - 1

            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor = (nextIndex + 1) < c2.length ? c2[nextIndex + 1].el : null

                //判断新节点是否在老节点里存在
                if (newIndexToOldIndexMap[i] === 0) {
                    //不存在， 添加
                    patch(null, nextChild, container, parentComponent, anchor)
                } else {
                    //存在，位置不同要移动位置
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log("移动位置")
                        insert(nextChild.el, container, anchor)
                    } else {
                        j--
                    }
                }
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
    function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
            mountChildren(vnode.children, el, parentComponent, anchor)
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
        insert(el, container, anchor)
    }

    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(element => {
            patch(null, element, container, parentComponent, anchor)
        });
    }

    function processComponent(n1, n2, container, parentComponent, anchor) {
        if(!n1) {
            mountComponent(n2, container, parentComponent, anchor)
        } else {
            updateComponent(n1, n2)
        }
    }

    function updateComponent(n1, n2) {
        //判断是否应该更新组件
        if(shouldUpdateComponent(n1, n2)) {
            const instance = (n2.component = n1.component)
            instance.next = n2
            instance.update()
        } else {

        }
    }



    function mountComponent(initialVnode: any, container: any, parentComponent, anchor) {
        const instance = (initialVnode.component = createComponentInstance(initialVnode, parentComponent))
        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container, anchor)
    }

    function setupRenderEffect(instance: any, initialVnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log("init")
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))

                //vnode -> patch
                //vnode -> element
                patch(null, subTree, container, instance, anchor)

                //element -> mount
                initialVnode.el = subTree.el

                instance.isMounted = true
            } else {
                console.log("update")

                const { next, vnode } = instance
                if(next) {
                    next.el = vnode.el
                    updateComponentPreRender(instance, next)
                }

                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree

                patch(preSubTree, subTree, container, instance, anchor)
            }
        }), {
            scheduler() {
                queueJobs(instance.update)
            }
        }
    }

    return {
        createApp: createAppApi(renderer)
    }

}

function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode
    instance.next = null

    instance.props = nextVNode.props
}

function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}


