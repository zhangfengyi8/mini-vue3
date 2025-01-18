import { renderer } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //先转换成vnode
            //component -> vnode
            //后续所有操作都基于虚拟节点处理
            const vnode = createVNode(rootComponent)

            renderer(vnode, rootContainer)
        }
    }
}

