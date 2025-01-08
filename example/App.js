export const App = {
    render() {
        return h("fiv", "hi, mini-vue" + this.msg)
    },

    setup() {
        return {
            msg: "mini-vue"
        }
    }
}