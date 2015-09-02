/* jslint node: true, esnext: true */

"use strict";

const defineGrammar = require('../../lib/grammar');

let myGrammar = defineGrammar({
  terminals: {
    'number': {}
  },
  operators: {
    '+': {
      precedence: 50,
      parseRigth: function (grammar) {
        return grammar.expression(50);
      },
      parseWithPrefix: function (grammar, prefix, right) {
        return Object.create(prefix, {
          value: {
            value: prefix.value + right.value
          }
        });
      }
    },
    '*': {
      precedence: 60,
      parseRigth: function (grammar) {
        return grammar.expression(60);
      },
      parseWithPrefix: function (grammar, prefix, right) {
        return Object.create(prefix, {
          value: {
            value: prefix.value * right.value
          }
        });
      }
    }
  }
});

debugger;

console.log(myGrammar.parse("1 + 41 * 3").value);
