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
      prefix: {
        '(': {
           led: function(grammar,left) {
              const e = grammar.expression(0);
              grammar.advance(')');
              return e; 
           }
         }
      },
      infix: {
        /*'(': {
          precedence: 80
        },*/
        '+': {
          precedence: 50,
          combine: function (grammar, left, right) {
            return Value(left.value + right.value);
          }
        },
        '-': {
          precedence: 50,
          combine: function (grammar, left, right) {
            return Value(left.value - right.value);
          }
        },
        '*': {
          precedence: 60,
          combine: function (grammar, left, right) {
            return Value(left.value * right.value);
          }
        },
        '/': {
          precedence: 60,
          combine: function (grammar, left, right) {
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
