/* jslint node: true, esnext: true */

"use strict";

const path = require('path');
const fs = require('fs');
const defineGrammar = require('../lib/grammar');

/*
test("Kitchen sink of tokens", function () {
  const tokens = [
    ["number", 4711, 1],
    ["string", "str2", 2],
    ["string", "str3", 2],
    ["string", "\b\f\n\r\t\"\'A", 2],
    ["identifier", "name1", 3],
    ["identifier", "name_2", 3],
    ["identifier", "n", 4],
    ["operator", "+", 5],
    ["operator", "-", 6],
    ["operator", "*", 7, 42],
    ["operator", "/", 8],
    ["operator", "(", 9],
    ["operator", ")", 9],
    ["operator", "{", 10],
    ["operator", "}", 10],
    ["operator", "[", 11],
    ["operator", "]", 11],
    ["operator", ":", 12],
    ["operator", ",", 12],
    ["operator", ";", 12],
    ["operator", ".", 12],
    ["operator", "<", 13],
    ["operator", "===", 13],
    ["operator", ">", 13],
    ["operator", "<=", 14],
    ["operator", ">=", 15],
    ["operator", "=", 16, 77]
  ];

  expect(tokens.length * 3 + 2);

  const s = fs.readFileSync(path.join(__dirname, 'fixtures', 'tokens1.txt'), {
    encoding: 'utf8'
  });

  const myGrammar = defineGrammar({
    operators: {
      '=': {
        precedence: 77
      },
      '+': {},
      '-': {},
      '*': {
        precedence: 42
      },
      '/': {},
      '(': {},
      ')': {},
      '[': {},
      ']': {},
      '{': {},
      '}': {},
      ':': {},
      '<': {},
      '>': {},
      '.': {},
      ',': {},
      ';': {},
      '<=': {},
      '>=': {},
      '=>': {},
      '===': {}
    }
  });

  let i = 0;

  for (let token of myGrammar.tokenizer(s)) {
    equal(token.type, tokens[i][0], "type: " + tokens[i][0]);
    equal(token.value, tokens[i][1], "value: " + tokens[i][1]);
    equal(token.lineNumber, tokens[i][2], "lineNumber: " + tokens[i][2]);
    if (tokens[i][3]) equal(token.precedence, tokens[i][3], "precedence: " +
      tokens[i][3]);
    i++;
  }
});
*/

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

    equal(myGrammar.parse("1 + 41 +"), 42);

  });
