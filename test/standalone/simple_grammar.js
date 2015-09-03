/* jslint node: true, esnext: true */

"use strict";

const defineGrammar = require('../../lib/grammar');

function Value(value) {
  return Object.create(null, {
    value: {
      value: value
    }
  });
}

let myGrammar = defineGrammar({
  terminals: {
    'number': {}
  },
  operators: {
    '-': {
      precedence: 50,
      parseExpression: function (grammar, left, right) {
        return Value(left.value - right.value);
      }
    },
    '+': {
      precedence: 50,
      parseExpression: function (grammar, left, right) {
        return Value(left.value + right.value);
      }
    },
    '*': {
      precedence: 60,
      parseExpression: function (grammar, left, right) {
        return Value(left.value * right.value);
      }
    },
    '/': {
      precedence: 60,
      parseExpression: function (grammar, left, right) {
        return Value(left.value / right.value);
      }
    }
  }
});

debugger;

console.log(myGrammar.parse("1 + 41 * 3").value);
