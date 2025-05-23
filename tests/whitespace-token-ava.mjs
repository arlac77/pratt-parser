import test from "ava";
import { WhiteSpaceToken } from "pratt-parser";

test("whitespace", t => {
  const pp = {
    chunk: "x   \n  A",
    offset: 1,
    lineNumber: 1
  };

  const token = WhiteSpaceToken.parse(pp);

  //t.is(token.value, undefined);
  t.is(pp.offset, 7);
  t.is(pp.lineNumber, 2);
});
