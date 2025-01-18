import { h, createTextVNode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");

    //可支持传入数组或单个vnode
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h(
            "p",
            {
              class: "red",
            },
            "header" + age
          ),
          createTextVNode("你好呀"),
        ],
        footer: () =>
          h(
            "p",
            {
              class: "red",
            },
            "footer"
          ),
      }
    );
    // const foo = h(Foo, {}, h("p", {class: "red"}, "123"))

    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
  //   render() {
  //     window.self = this;

  //     //ui
  //     return h(
  //       "div",
  //       {
  //         id: "root",
  //         class: ["red"],
  //         onClick() {
  //           //   console.log("click");
  //         },
  //       },
  //       [
  //         h("div", {}, "hi," + this.msg),
  //         h(Foo, {
  //           count: 1,
  //           onAdd(a, b) {
  //             console.log("onAdd", a, b);
  //           },
  //           onAddFoo(a, b) {
  //             console.log("onAddFoo", a, b);
  //           },
  //         }),
  //       ]
  //       // "hi," + this.msg,
  //       // [h("p", { class: "red" }, "hi"), h("p", { class:"blue" }, "mini-vue")]
  //     );
  //   },

  //   setup() {
  //     return {
  //       msg: "mini-vue666",
  //     };
  //   },
};
