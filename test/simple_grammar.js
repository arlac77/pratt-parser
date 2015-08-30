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
    let myGrammar = defineGrammar({
      terminals: {
        'number': {}
      },
      operators: {
        '+': {
          precedence: 50,
          parseWithPrefix: function (prefix, grammar) {
            const right = grammar.expression(50);
            return Object.create(prefix, {
              value: {
                value: prefix.value + right.value
              }
            });
          }
        },
        '*': {
          precedence: 60,
          parseWithPrefix: function (prefix, grammar) {
            const right = grammar.expression(60);
            return Object.create(prefix, {
              value: {
                value: prefix.value * right.value
              }
            });
          }
        }
      }
    });

    it("evaluates", function () {
      assert.equal(myGrammar.parse("1 + 41 * 3 ").value, 124);
    });
  });

/*
 att1.att2[name='herbert'].att3
*/
