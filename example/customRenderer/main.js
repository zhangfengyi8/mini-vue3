import { createRenderer } from "../../lib/guide-mini-vue.esm.js"
import { App }  from "./App.js"
//vue3
console.log(PIXI)


// 创建一个新的 Application 实例
const game = new PIXI.Application();

// 初始化 Application 的配置
await game.init({
    width: 500, // 画布宽度
    height: 500, // 画布高度
});

// 将画布添加到页面
document.body.appendChild(game.canvas );

const renderer = createRenderer({
    createElement(type) {
        if(type === "rect") {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()

            return rect
        }
    },
    patchProp(el, key, val) {
        el[key] = val
    },
    insert(el, parent) {
        parent.addChild(el)
    }
})

renderer.createApp(App).mount(game.stage)

// const rootContainer = document.querySelector("#app")
// createApp(App).mount(rootContainer);

