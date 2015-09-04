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
  infix: {
    '(': {
      precedence: 80,
      parse(left) {}
    },
    '+': {
      precedence: 50,
      combine: function (left, right) {
        return Value(left.value + right.value);
      }
    },
    '-': {
      precedence: 50,
      combine: function (left, right) {
        return Value(left.value - right.value);
      }
    },
    '*': {
      precedence: 60,
      combine: function (left, right) {
        return Value(left.value * right.value);
      }
    },
    '/': {
      precedence: 60,
      combine: function (left, right) {
        return Value(left.value / right.value);
      }
    }
  }
});

console.log(myGrammar.parse("1 + 41 * 3").value);
