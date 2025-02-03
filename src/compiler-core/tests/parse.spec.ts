import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe("Parse", () => {
    describe("text", () => {
        test("simple text", () => {
          const ast = baseParse("{{message}}");
          const text = ast.children[0];
          console.log(text)
    
          expect(text).toStrictEqual({
            type: NodeTypes.INTERPOLATION,
            content: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: "message"
            }
        });
        });
    })
})