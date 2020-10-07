import test from "ava";
import { LineCommentToken } from "pratt-parser";

test("line comment", t => {
  const tokenizer = {};
  const pp = {
    chunk: "x#   \n  A",
    offset: 1,
    lineNumber: 1
  };

  const token = LineCommentToken.parseString(pp);

  //t.is(token.value, undefined);
  t.is(pp.offset, 5);
  t.is(pp.lineNumber, 2);
});
