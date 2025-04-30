#!/usr/bin/env node
/* WIP does not work for now!!! */

import {
  Parser,
  WhiteSpaceToken,
  NumberToken,
  IdentifierToken
} from "pratt-parser";

function value(value) {
  return Object.create(null, {
    value: {
      value
    }
  });
}

const tnsGrammar = new Parser({
  tokens: [WhiteSpaceToken, NumberToken, IdentifierToken],

  prefix: {
    "(": {
      nud(grammar) {
        const e = grammar.expression(0);
        grammar.advance(")");
        console.log(
          "EXPRESSION",
          e.map(e => e.value)
        );
        return e;
      }
    }
  },
  infixr: {
  },
  infix: {
    ")": {
    },
    "=": {
      precedence: 50,
      combine: (left, right) => [left, right]
    }
  }
});

console.log(
  tnsGrammar.parse(`(ADDRESS_LIST=
  (FAILOVER=ON)
  (LOAD_BALANCE=off)
  (ADDRESS=(PROTOCOL=tcp)(HOST=host2a)(PORT=1630))
  (ADDRESS=(PROTOCOL=tcp)(HOST=host2b)(PORT=1630))`).value
);
