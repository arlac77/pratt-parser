import test from "ava";

import { KeywordToken } from "../src/known-tokens.mjs";
import { Tokenizer } from "../src/tokenizer.mjs";

test("keyword", t => {
  const keywords = Object.create(KeywordToken, {
    keywords: {
      value: {
        CREATE: {},
        TABLE: {}
      }
    }
  });

  const tokenizer = new Tokenizer({});

  keywords.registerWithinTokenizer(tokenizer);

  const pp = {
    chunk: " CREATE TABLE X ",
    offset: 1,
    lineNumber: 1,
    get properties() {
      return {};
    }
  };

  const k1 = keywords.parseString(pp);
  t.is(k1.value, "CREATE");
  t.is(pp.offset, 8);
  t.is(pp.lineNumber, 1);

  const k2 = keywords.parseString(pp);
  t.is(k2.value, "TABLE");
  t.is(pp.offset, 14);
  t.is(pp.lineNumber, 1);
});
