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
      parseWithPrefix: function (prefix,grammar) {
        const right = grammar.expression(50);
        console.log(`${prefix} + ${right}`);
        return Object.create(prefix,{ value: { value: prefix.value + right.value }});
      }
    },
    '*': {
      precedence: 60,
      parseWithPrefix: function (prefix,grammar) {
        const right = grammar.expression(60);
        console.log(`${prefix} * ${right}`);
        return Object.create(prefix,{ value: { value: prefix.value * right.value }});
      }
    }
  }
});

debugger;

console.log(myGrammar.parse("1 + 41 * 3 ").value);
