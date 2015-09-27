/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const defineGrammar = require('../lib/grammar');


describe("calculator",
  function () {
    function Value(value) {
      return Object.create(null, {
        value: {
          value: value
        }
      });
    }

    let myGrammar = defineGrammar({
      terminals: {
        'number': {}
      },
      prefix: {
        '(': {
          nud: function (grammar) {
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
          combine: function (left, right) {
            return Value(left.value + right.value);
          }
        },
        '-': {
          precedence: 50,
          combine: function (left, right) {
            return Value(left.value - right.value);
          }
        },
        '*': {
          precedence: 60,
          combine: function (left, right) {
            return Value(left.value * right.value);
          }
        },
        '/': {
          precedence: 60,
          combine: function (left, right) {
            return Value(left.value / right.value);
          }
        }
      }
    });

    it("evaluates", function () {
      assert.equal(myGrammar.parse("1 + 41 * 3 - 2").value, 122);
    });

    it("evaluates with prefix op", function () {
      assert.equal(myGrammar.parse("(1 + 41)").value, 42);
    });
  });
