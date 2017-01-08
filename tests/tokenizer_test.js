/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  path = require('path'),
  fs = require('fs');

const {
  Tokenizer
} = require('../dist/parser');

describe('tokens', () => {
  const tokenizer = new Tokenizer({
    infix: {
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
      '===': {},
      '!===': {}
    }
  });

  describe('trailing space', () => {
    const tokens = [{
      type: 'identifier',
      value: 'A'
    }];

    let i = 0;

    for (let token of tokenizer.tokens('A ')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.id, refToken.id, 'id: ' + refToken.id);
      });
    }
  });

  describe('trailing number', function () {
    const tokens = [{
      type: 'number',
      value: 123
    }];

    let i = 0;

    for (let token of tokenizer.tokens('123')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.value, refToken.value, 'value: ' + refToken.value);
      });
    }
  });

  describe('trailing string', () => {
    const tokens = [{
      type: 'string',
      value: 'ABC'
    }];

    let i = 0;

    for (let token of tokenizer.tokens('"ABC"')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.value, refToken.value, 'value: ' + refToken.value);
      });
    }
  });

  describe('trailing identifier', () => {
    const tokens = [{
      type: 'identifier',
      value: 'ABC'
    }];

    let i = 0;

    for (let token of tokenizer.tokens('ABC')) {
      const refToken = tokens[i];

      it(`tokens ${refToken.type}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.value, refToken.value, 'value: ' + refToken.value);
      });
    }
  });

  describe('unknown char', () => {
    it('thows', () => {
      try {
        for (const token of tokenizer.tokens('%')) {
          console.log(token);
        }
        assert.ok(false);
      } catch (e) {
        if (e.message !== '1,1: Unknown char: {"value":"%"}') {
          throw e;
        }
      }
    });
  });

  describe('unterminated string', () => {
    it('thows', () => {
      try {
        for (const token of tokenizer.tokens('\"abc')) {
          console.log(token);
        }
        assert.ok(false);
      } catch (e) {
        if (e.message !== '1,4: Unterminated string: {"value":"abc"}') {
          throw e;
        }
      }
    });

    it('thows when in \\u', () => {
      try {
        for (const token of tokenizer.tokens('\"\\u\"')) {
          console.log(token);
        }
        assert.ok(false);
      } catch (e) {
        if (e.message !== '1,2: Unterminated string: {"value":""}') {
          throw e;
        }
      }
    });
  });


  describe('Kitchen sink', function () {
    const tokens = [{
      type: 'number',
      value: 4711,
      line: 1,
      pos: 4
    }, {
      type: 'number',
      value: 0.23,
      line: 1,
      pos: 9
    }, {
      type: 'number',
      value: 12345.0,
      line: 1,
      pos: 17
    }, {
      type: 'number',
      value: 12.4E20,
      line: 1,
      pos: 25
    }, {
      type: 'number',
      value: 0.4E7,
      line: 1,
      pos: 31
    }, {
      type: 'string',
      value: 'str2',
      line: 2,
      pos: 7
    }, {
      type: 'string',
      value: 'str3',
      line: 2,
      pos: 13
    }, {
      type: 'string',
      value: '\b\f\n\r\t\"\'A',
      line: 2
    }, {
      type: 'string',
      value: 'str4',
      line: 2
    }, {
      type: 'string',
      value: 'str5',
      line: 2
    }, {
      type: 'identifier',
      value: 'name1',
      line: 3
    }, {
      type: 'identifier',
      value: 'name_2',
      line: 3
    }, {
      type: 'identifier',
      value: '_name3',
      line: 3
    }, {
      type: 'identifier',
      value: 'n',
      line: 4
    }, {
      type: 'operator',
      value: '+',
      line: 5
    }, {
      type: 'operator',
      value: '-',
      line: 6
    }, {
      type: 'operator',
      value: '*',
      line: 7,
      precedence: 42
    }, {
      type: 'operator',
      value: '/',
      line: 8
    }, {
      type: 'operator',
      value: '(',
      line: 9
    }, {
      type: 'operator',
      value: ')',
      line: 9
    }, {
      type: 'operator',
      value: '{',
      line: 10
    }, {
      type: 'operator',
      value: '}',
      line: 10
    }, {
      type: 'operator',
      value: '[',
      line: 11
    }, {
      type: 'operator',
      value: ']',
      line: 11
    }, {
      type: 'operator',
      value: ':',
      line: 12
    }, {
      type: 'operator',
      value: ',',
      line: 12
    }, {
      type: 'operator',
      value: ';',
      line: 12
    }, {
      type: 'operator',
      value: '.',
      line: 12
    }, {
      type: 'operator',
      value: '<',
      line: 13
    }, {
      type: 'operator',
      value: '===',
      line: 13
    }, {
      type: 'operator',
      value: '!===',
      line: 13,
      //      pos: 22
    }, {
      type: 'operator',
      value: '>',
      line: 13
    }, {
      type: 'operator',
      value: '<=',
      line: 14
    }, {
      type: 'operator',
      value: '>=',
      line: 15
    }, {
      type: 'operator',
      value: '=',
      line: 16,
      precedence: 77
    }, {
      type: 'number',
      value: 2,
      line: 17
    }, {
      type: 'operator',
      value: '+',
      line: 17
    }, {
      type: 'operator',
      value: '(',
      line: 17
    }, {
      type: 'number',
      value: 3,
      line: 17
    }, {
      type: 'operator',
      value: '*',
      line: 17
    }, {
      type: 'number',
      value: 17,
      line: 17
    }, {
      type: 'operator',
      value: ')',
      line: 17
    }];

    const s = fs.readFileSync(path.join(__dirname, 'fixtures', 'tokens1.txt'), {
      encoding: 'utf8'
    });

    let i = 0;

    for (const token of tokenizer.tokens(s)) {
      const refToken = tokens[i];
      it(`tokens ${refToken.type} ${refToken.type === 'string' ? '' : refToken.value}`, () => {
        assert.equal(token.type, refToken.type, 'type: ' + refToken.type);
        assert.equal(token.id, refToken.id, 'value: ' + refToken.id);
        assert.equal(token.lineNumber, refToken.line, 'lineNumber: ' + refToken.line);
        if (refToken.pos !== undefined) {
          assert.equal(token.positionInLine, refToken.pos, 'pos: ' + refToken.pos);
        }
        if (refToken.precedence) assert.equal(token.precedence, refToken.precedence, 'precedence: ' +
          refToken.precedence);
      });
      i++;
    }
  });
});
