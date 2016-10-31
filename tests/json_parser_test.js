/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const createGrammar = require('../dist/parser').create;

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
      identifier(value, properties, context) {
          if (value === 'true') {
            properties.type.value = 'constant';
            properties.value.value = true;
          } else if (value === 'false') {
            properties.type.value = 'constant';
            properties.value.value = false;
          }
        },
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
          '{': {
            nud(grammar, left) {
              const object = {};

              if (grammar.token.value !== '}') {
                while (true) {
                  const key = grammar.expression(0).value;

                  if (grammar.token.value !== ':') {
                    break;
                  }
                  grammar.advance(':');

                  const value = grammar.expression(0).value;
                  object[key] = value;
                  if (grammar.token.value === '}') {
                    break;
                  }
                  grammar.advance(',');
                }
              }
              grammar.advance('}');
              return Value(object);
            }
          }
        },
        infix: {
          ',': {},
          ':': {},
          '}': {},
          ']': {}
        }
    });

    it('simple array', () => assert.deepEqual(myGrammar.parse('[1,"b",[4],{ "c" : 5, "d" : true, "e": false}]').value, [
      1, "b", [4], {
        "c": 5,
        "d": true,
        "e": false
      }
    ]));
  });
