import { NodeTypes } from "./ast"

export function baseParse(content: string) {

    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context) {
    const nodes: any[] = []
    let node
    if(context.source.startsWith("{{")) {
        node = parseInterpolation(context)
    }

    nodes.push(node)

    return nodes
}

function parseInterpolation(context) {

    //{{message}}
    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
    context.source = context.source.slice(openDelimiter.length)

    const rawContent = context.source.slice(0, closeIndex - openDelimiter.length)

    const content = rawContent.trim()

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function createRoot(children) {
    return {
        children
    }
}

function createParserContext(content: string): any {
    return {
        source: content
    }
}