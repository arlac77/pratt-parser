/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  Parser
} = require('../dist/parser');

describe('calculator',
  function () {
    function value(value) {
      return Object.create(null, {
        value: {
          value: value
        }
      });
    }

    const myGrammar = new Parser({
      prefix: {
        '(': {
          nud(grammar) {
            const e = grammar.expression(0);
            grammar.advance(')');
            return e;
          }
        }
      },
      infix: {
        ')': {},
        '+': {
          precedence: 50,
          combine: (left, right) => value(left.value + right.value)
        },
        '-': {
          precedence: 50,
          combine: (left, right) => value(left.value - right.value)
        },
        '*': {
          precedence: 60,
          combine: (left, right) => value(left.value * right.value)
        },
        '/': {
          precedence: 60,
          combine: (left, right) => value(left.value / right.value)
        }
      }
    });

    it('evaluates', () => assert.equal(myGrammar.parse('1 + 41 * 3 - 2').value, 122));
    it('evaluates with prefix op', () => assert.equal(myGrammar.parse('(1 + 41)').value, 42));
    it('evaluates with prefix op 2', () => assert.equal(myGrammar.parse('(1 + 41) * 2').value, 84));
    it('evaluates with prefix op 3', () => assert.equal(myGrammar.parse('(1 + 1) * (2 + 7)').value, 18));
    it('evaluates with prefix op 4', () => assert.equal(myGrammar.parse('(1 + (1 + 4 * 3)) * (2 + 1)').value, 42));

    describe('unexpected token', () => {
      it('thows', () => {
        try {
          myGrammar.parse('(1 + %');
          assert.ok(false);
        } catch (e) {
          if (e.message !== '1,6: Unknown char: {"value":"%"}') {
            throw e;
          }
        }
      });
    });

  });
