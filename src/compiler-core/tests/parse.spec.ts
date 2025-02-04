import { ElementTypes, NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe("Parse", () => {
    describe("text", () => {
        it("simple text", () => {
            const ast = baseParse("{{message}}");
            const text = ast.children[0];

            expect(text).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: "message"
                }
            });
        });
    })
    describe("element", () => {
        it("simple element div", () => {
            const ast = baseParse("<div></div>");
            const text = ast.children[0];
            console.log(JSON.stringify(text))
            expect(text).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: "div",
                tagType: ElementTypes.ELEMENT,
                children: []
            });
        });
    })
    describe("text", () => {
        it("simple text", () => {
            const ast = baseParse("some text");
            const text = ast.children[0];

            expect(text).toStrictEqual({
                type: NodeTypes.TEXT,
                content: "some text"
            });
        });
    })

    test("hello world", () => {
        const ast = baseParse("<p>hi,{{message}}</p>");
        const text = ast.children[0];
        console.log(JSON.stringify(text))

        expect(text).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "p",
            tagType: ElementTypes.ELEMENT,
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: "hi,"
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                }
            ]
        });
    })

    test("Nested element", () => {
        const ast = baseParse("<div><p>hi,</p>{{message}}</div>");
        const text = ast.children[0];
        console.log(JSON.stringify(text))

        expect(text).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            tagType: ElementTypes.ELEMENT,
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: "p",
                    tagType: ElementTypes.ELEMENT,
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: "hi,"
                        }
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                }
            ]
        });
    })
})