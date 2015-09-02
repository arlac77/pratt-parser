/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const path = require('path');
const fs = require('fs');
const defineGrammar = require('../src/grammar');

describe("tokens", function () {
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

  describe("trailing space", function () {
    const tokens = [{
      type: "identifier",
      value: 'A'
    }];

    let i = 0;

    for (let token of myGrammar.tokenizer('A ')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, function () {
        assert.equal(token.type, refToken.type, "type: " + refToken.type);
        assert.equal(token.value, refToken.value, "value: " + refToken.value);
      });
    }
  });

  describe("trailing number", function () {
    const tokens = [{
      type: "number",
      value: 123
    }];

    let i = 0;

    for (let token of myGrammar.tokenizer('123')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, function () {
        assert.equal(token.type, refToken.type, "type: " + refToken.type);
        assert.equal(token.value, refToken.value, "value: " + refToken.value);
      });
    }
  });

  describe("trailing identifier", function () {
    const tokens = [{
      type: "identifier",
      value: "ABC"
    }];

    let i = 0;

    for (let token of myGrammar.tokenizer('ABC')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, function () {
        assert.equal(token.type, refToken.type, "type: " + refToken.type);
        assert.equal(token.value, refToken.value, "value: " + refToken.value);
      });
    }
  });

  /*
    describe("unterminated string", function () {
      const tokens = [{
        type: "string",
        value: "ABCD"
      }];

      it(`should fail`, function () {
        try {
          const tokens = myGrammar.tokenizer("\"ABCD");
        } catch (e) {}
      });
    });
  */
  describe("Kitchen sink", function () {
    const tokens = [{
      type: "number",
      value: 4711,
      line: 1
    }, {
      type: "string",
      value: "str2",
      line: 2
    }, {
      type: "string",
      value: "str3",
      line: 2
    }, {
      type: "string",
      value: "\b\f\n\r\t\"\'A",
      line: 2
    }, {
      type: "identifier",
      value: "name1",
      line: 3
    }, {
      type: "identifier",
      value: "name_2",
      line: 3
    }, {
      type: "identifier",
      value: "_name3",
      line: 3
    }, {
      type: "identifier",
      value: "n",
      line: 4
    }, {
      type: "operator",
      value: "+",
      line: 5
    }, {
      type: "operator",
      value: "-",
      line: 6
    }, {
      type: "operator",
      value: "*",
      line: 7,
      precedence: 42
    }, {
      type: "operator",
      value: "/",
      line: 8
    }, {
      type: "operator",
      value: "(",
      line: 9
    }, {
      type: "operator",
      value: ")",
      line: 9
    }, {
      type: "operator",
      value: "{",
      line: 10
    }, {
      type: "operator",
      value: "}",
      line: 10
    }, {
      type: "operator",
      value: "[",
      line: 11
    }, {
      type: "operator",
      value: "]",
      line: 11
    }, {
      type: "operator",
      value: ":",
      line: 12
    }, {
      type: "operator",
      value: ",",
      line: 12
    }, {
      type: "operator",
      value: ";",
      line: 12
    }, {
      type: "operator",
      value: ".",
      line: 12
    }, {
      type: "operator",
      value: "<",
      line: 13
    }, {
      type: "operator",
      value: "===",
      line: 13
    }, {
      type: "operator",
      value: ">",
      line: 13
    }, {
      type: "operator",
      value: "<=",
      line: 14
    }, {
      type: "operator",
      value: ">=",
      line: 15
    }, {
      type: "operator",
      value: "=",
      line: 16,
      precedence: 77
    }];

    const s = fs.readFileSync(path.join(__dirname, 'fixtures', 'tokens1.txt'), {
      encoding: 'utf8'
    });


    let i = 0;

    for (let token of myGrammar.tokenizer(s)) {
      const refToken = tokens[i];
      it(`tokens ${refToken.type}`, function () {
        assert.equal(token.type, refToken.type, "type: " + refToken.type);
        assert.equal(token.value, refToken.value, "value: " + refToken.value);
        assert.equal(token.lineNumber, refToken.line, "lineNumber: " + refToken.line);
        if (refToken.precedence) assert.equal(token.precedence, refToken.precedence, "precedence: " +
          refToken.precedence);
      });
      i++;
    }
  });
});
