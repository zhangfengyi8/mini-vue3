import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    setup() {
        return {}
    },
    render() {
        const foo = h("p", {}, "foo")

        //实现插槽就是先获取Foo组件的虚拟节点vnode，再获取vnode里面的children
        console.log(this.$slots)

        //renderSlots
        //具名插槽
        //1. 获取到渲染的元素
        //2. 获取到渲染的位置
        //作用域插槽
        //children必须是虚拟节点
        const age = 18
        return h("div", {}, [
            renderSlots(this.$slots, "header", {
                age
            }), 
            foo, 
            renderSlots(this.$slots, "footer")
        ])
    }
//   setup(props, { emit }) {
//     //props.count
//     //shallowReadonly
//     // props.count++
//     // console.log(props);
//     const emitAdd = () => {
//     //   console.log("emit add");
//       emit("add",1, 2);
//       emit("add-foo", 1, 2)

//     };

//     return {
//       emitAdd,
//     };
//   },
//   render() {
//     // return h("div", {}, "foo: " + this.count);
//     const btn = h(
//       "button",
//       {
//         onClick: this.emitAdd,
//       },
//       "emitAdd"
//     );
//     const foo = h("p", {}, "foo");
//     return h("div", {}, [foo, btn]);
//   },
};
