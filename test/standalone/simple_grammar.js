/* jslint node: true, esnext: true */

"use strict";

const defineGrammar = require('../../lib/grammar');

let myGrammar = defineGrammar({
  terminals: {
    'number': {}
  },
  operators: {
    '-': {
      precedence: 50,
      parseExpression: function (grammar, left, right) {
        return Object.create(left, {
          value: {
            value: left.value - right.value
          }
        });
      }
    },
    '+': {
      precedence: 50,
      parseExpression: function (grammar, left, right) {
        return Object.create(left, {
          value: {
            value: left.value + right.value
          }
        });
      }
    },
    '*': {
      precedence: 60,
      parseExpression: function (grammar, left, right) {
        return Object.create(left, {
          value: {
            value: left.value * right.value
          }
        });
      }
    }
  }
});

debugger;

console.log(myGrammar.parse("1 + 41 * 3").value);
