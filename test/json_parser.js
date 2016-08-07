/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const createGrammar = require('../lib/grammar').createGrammar;

describe('json',
  function () {
    function Value(value) {
      return Object.create(null, {
        value: {
          value: value
        }
      });
    }

    let myGrammar = createGrammar({
      prefix: {
        '[': {
          nud(grammar, left) {
            const values = [];

            if (grammar.token.value !== ']') {
              while (true) {
                values.push(grammar.expression(0).value);

                if (grammar.token.value !== ',') {
                  break;
                }
                grammar.advance(',');
              }
            }
            grammar.advance(']');
            return Value(values);
          }
        },
      },
      infix: {
        ',': {},
        ':': {},
        '{': {},
        '}': {},
        ']': {}
      }
    });

    it('simple array', () => assert.deepEqual(myGrammar.parse('[1,"b",[4]]').value, [1, "b", [4]]));
  });
