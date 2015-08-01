/* jslint node: true, esnext: true */

"use strict";

const defineGrammar = require('../../lib/grammar');

let myGrammar = defineGrammar({
  terminals: {
    'number': {}
  },
  operators: {
    '+': {
      precedence: 1,
      parseWithPrefix: function (prefix) {
        console.log(`+ parseWithPrefix: ${prefix}`);
        return prefix;
      }
    }
  }
});

debugger;

myGrammar.parse("1 + 41 ;");
