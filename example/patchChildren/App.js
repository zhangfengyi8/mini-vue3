import { h } from "../../lib/guide-mini-vue.esm.js";

import ArrayToText  from "./ArrayToText.js"
import ArrayToArray from "./ArrayToArray.js"
 
export const App = {
    name: "App",

    setup() {},

    render() {
        return h("div", {tiId: 1}, [
            h("p", {}, "主页"),

            // h(ArrayToText),
            h(ArrayToArray)
        ])
    }
}