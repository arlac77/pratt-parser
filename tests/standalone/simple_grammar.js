/* jslint node: true, esnext: true */

'use strict';

const {
  Parser, WhiteSpaceToken, NumberToken
} = require('../../dist/parser');

function Value(value) {
  return Object.create(null, {
    value: {
      value: value
    }
  });
}

const myGrammar = new Parser({
  tokens: [
    WhiteSpaceToken,
    NumberToken
  ],
  infix: {
    ')': {},
    '+': {
      precedence: 50,
      combine: (left, right) => Value(left.value + right.value)
    },
    '-': {
      precedence: 50,
      ccombine: (left, right) => Value(left.value - right.value)
    },
    '*': {
      precedence: 60,
      combine: (left, right) => Value(left.value * right.value)
    },
    '/': {
      precedence: 60,
      combine: (left, right) => Value(left.value / right.value)
    }
  }});

console.log(myGrammar.parse('1 + 41 * 3').value);
