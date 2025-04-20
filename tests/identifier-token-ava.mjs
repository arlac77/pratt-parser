import test from "ava";
import { IdentifierToken } from "pratt-parser";

test("identifier tokens", t => {
  const pp = {
    chunk: " abc   \n  A",
    offset: 1,
    lineNumber: 1,
    get properties() {
      return {};
    }
  };

  const token = IdentifierToken.parseString(pp);

  t.is(token.value, "abc");
  t.is(pp.offset, 4);
});
