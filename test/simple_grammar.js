/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const defineGrammar = require('../src/grammar');


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
      operators: {
        //        '(': {},
        //        ')': {},
        '-': {
          precedence: 50,
          parseExpression: function (grammar, left, right) {
            return Value(left.value - right.value);
          }
        },
        '+': {
          precedence: 50,
          parseExpression: function (grammar, left, right) {
            return Value(left.value + right.value);
          }
        },
        '*': {
          precedence: 60,
          parseExpression: function (grammar, left, right) {
            return Value(left.value * right.value);
          }
        },
        '/': {
          precedence: 60,
          parseExpression: function (grammar, left, right) {
            return Value(left.value / right.value);
          }
        }
      }
    });

    it("evaluates", function () {
      assert.equal(myGrammar.parse("1 + 41 * 3 - 2").value, 122);
    });

    /*
        it("evaluates 2", function () {
          assert.equal(myGrammar.parse("(1 + 41) * 3 - 2").value, 124);
        });
    */
  });

/*
 att1.att2[name='herbert'].att3
*/
