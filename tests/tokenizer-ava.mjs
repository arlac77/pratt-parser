import test from "ava";
import {
  Tokenizer,
  WhiteSpaceToken,
  NumberToken,
  StringToken,
  IdentifierToken
} from "pratt-parser";

test.only("tokens trailing space", t => {
  const tokenizer = new Tokenizer({
    tokens: [WhiteSpaceToken, NumberToken, StringToken, IdentifierToken],

    infix: {
      "=": {
        precedence: 77
      },
      "+": {},
      "-": {},
      "*": {
        precedence: 42
      },
      "/": {},
      "(": {},
      ")": {},
      "[": {},
      "]": {},
      "{": {},
      "}": {},
      ":": {},
      "<": {},
      ">": {},
      ".": {},
      ",": {},
      ";": {},
      "<=": {},
      ">=": {},
      "=>": {},
      "===": {},
      "!===": {}
    }
  });

  const tokens = [
    {
      type: "identifier",
      value: "A"
    },
    {
      type: "EOF"
    }
  ];

  let i = 0;

  for (const token of tokenizer.tokens("A ")) {
    const refToken = tokens[i];
    t.is(token.type, refToken.type, `${i}:`);
    t.is(token.id, refToken.id, `${i}:`);
    i++;
  }
});

/*
  describe('trailing number', function() {
    const tokens = [
      {
        type: 'number',
        value: 123
      }
    ];

    let i = 0;

    for (const token of tokenizer.tokens('123')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.value, refToken.value, 'value: ' + refToken.value);
      });
    }
  });

  describe('trailing string', () => {
    const tokens = [
      {
        type: 'string',
        value: 'ABC'
      }
    ];

    let i = 0;

    for (const token of tokenizer.tokens('"ABC"')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.value, refToken.value, 'value: ' + refToken.value);
      });
    }
  });

  describe('trailing identifier', () => {
    const tokens = [
      {
        type: 'identifier',
        value: 'ABC'
      }
    ];

    let i = 0;

    for (const token of tokenizer.tokens('ABC')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.value, refToken.value, 'value: ' + refToken.value);
      });
    }
  });

  describe('unknown char', () => {
    it('thows', () => {
      try {
        for (const token of tokenizer.tokens('%')) {
          console.log(token);
        }
        assert.ok(false);
      } catch (e) {
        if (e.message !== '1,1: Unknown char "%"') {
          throw e;
        }
      }
    });
  });

  describe('unterminated string', () => {
    it('thows', () => {
      try {
        for (const token of tokenizer.tokens('"abc')) {
          console.log(token);
        }
        assert.ok(false);
      } catch (e) {
        if (e.message !== '1,0: Unterminated string "abc"') {
          throw e;
        }
      }
    });

    it('thows when in \\u', () => {
      try {
        for (const token of tokenizer.tokens('"\\u"')) {
          console.log(token);
        }
        assert.ok(false);
      } catch (e) {
        if (e.message !== '1,0: Unterminated string ""') {
          throw e;
        }
      }
    });
  });
});

*/
