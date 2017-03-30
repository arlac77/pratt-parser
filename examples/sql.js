/* jslint node: true, esnext: true */

/* WIP does not work for now!!! */

'use strict';

const {
  Parser, WhiteSpaceToken, StringToken, NumberToken, KeywordToken, IdentifierToken
} = require('../dist/parser');

function Value(value) {
  return Object.create(null, {
    value: {
      value: value
    }
  });
}

const sqlGrammar = new Parser({
  tokens: [
    WhiteSpaceToken,
    NumberToken,
    StringToken,
    Object.create(KeywordToken, {
      keywords: {
        value: {
          CREATE: {},
          TABLE: {},
          CHAR: {},
          NUMBER: {},
          NOT: {},
          NULL: {}
        }
      }
    }),
    IdentifierToken
  ],
  infix: {
    '(': {},
    ')': {}
  }
});

console.log(sqlGrammar.parse('CREATE TABLE t1(a1 CHAR(10),a2 NUMBER NOT NULL)').value);
