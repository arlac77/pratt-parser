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
  Tokenizer, WhiteSpaceToken, NumberToken, StringToken, IdentifierToken
} = require('../dist/parser');

describe('tokens', () => {
  const tokenizer = new Tokenizer({
    tokens: [
      WhiteSpaceToken,
      NumberToken,
      StringToken,
      IdentifierToken
    ],
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

  describe('Kitchen sink', function () {
    const tokens = [{
      type: 'number',
      value: 4711,
      line: 1,
      pos: 0
    }, {
      type: 'number',
      value: 0.23,
      line: 1,
      pos: 5
    }, {
      type: 'number',
      value: 12345.0,
      line: 1,
      pos: 10
    }, {
      type: 'number',
      value: 12.4E20,
      line: 1,
      pos: 18
    }, {
      type: 'number',
      value: 0.4E7,
      line: 1,
      pos: 26
    }, {
      type: 'string',
      value: 'str2',
      line: 2,
      pos: 1
    }, {
      type: 'string',
      value: 'str3',
      line: 2,
      pos: 7
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
