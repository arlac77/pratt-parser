/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const createGrammar = require('../lib/grammar').createGrammar;

describe("mini_lang",
  function () {
    function Value(value) {
      return Object.create(null, {
        value: {
          value: value
        }
      });
    }

    const identifiers = {
      array: [1, 2, 3, 4, 5, 6, 7]
    };

    let myGrammar = createGrammar({
      terminals: {
        'number': {},
        'identifier': {}
      },
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
        ']': {},
        '[': {
          precedence: 40,
          led(grammar, left) {
            const right = grammar.expression(0);
            const array = identifiers[left.value];
            grammar.advance(']');
            return Value(array[right.value]);
          }
        },
        '+': {
          precedence: 50,
          combine(left, right) {
            return Value(left.value + right.value);
          }
        },
        '-': {
          precedence: 50,
          combine(left, right) {
            return Value(left.value - right.value);
          }
        },
        '*': {
          precedence: 60,
          combine(left, right) {
            return Value(left.value * right.value);
          }
        },
        '/': {
          precedence: 60,
          combine(left, right) {
            return Value(left.value / right.value);
          }
        }
      }
    });

    it("evaluates array", function () {
      assert.equal(myGrammar.parse("array[3 * 2] + 2").value, 9);
    });

    xit("evaluates function", function () {
      assert.equal(myGrammar.parse("concat('prefix','postfix')").value, 'prefixpostfix');
    });
  });
