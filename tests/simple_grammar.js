/* jslint node: true, esnext: true */

"use strict";

const path = require('path');
const fs = require('fs');
const defineGrammar = require('../lib/grammar');


test("calculator",
  function () {
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

    expect(1);

    equal(myGrammar.parse("1 + 41 ;"), 42);
  });
