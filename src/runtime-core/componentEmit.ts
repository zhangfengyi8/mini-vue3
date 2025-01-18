
export function emit(instance, event, ...args) {
    // console.log("emit" + event)

    // instance.props -> event
    const { props } = instance

    // add -> Add
    //add-foo -> addFoo
    const camelize = (str: string) => {
        return str.replace(/-(\w)/g, (_, c:string) => {
            return c ? c.toUpperCase() : ""
        })
    }


    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const toHanderKey = (str: string) => {
        return str ? "on" + capitalize(str) : ""
    }

    const handlerName = toHanderKey(camelize(event))
    // console.log(handlerName)
    const handler = props[handlerName]
    handler && handler(...args)
    // const handler = props["onAdd"]
    // handler && handler( )
}