/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  Parser, Tokenizer, IdentifierToken
} = require('../dist/parser');

describe('json',
  function () {
    function Value(value) {
      return Object.create(null, {
        value: {
          value: value
        }
      });
    }

    class MyTokenizer extends Tokenizer {
      makeIdentifier(chunk, offset, context, properties) {
        let i = offset;
        i += 1;
        for (;;) {
          const c = chunk[i];
          if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') || c === '_') {
            i += 1;
          } else {
            break;
          }
        }

        const value = chunk.substring(offset, i);

        properties.value = {
          value: value
        };

        if (value === 'true') {
          properties.value.value = true;
        } else if (value === 'false') {
          properties.value.value = false;
        }

        return [Object.create(IdentifierToken, properties), i - offset];
      }
    }
    const g = {
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
    };

    const myGrammar = new Parser(g, {
      tokenizer: new MyTokenizer(g)
    });

    it('simple array', () => assert.deepEqual(myGrammar.parse('[1,"b",[4],{ "c" : 5, "d" : true, "e": false}]').value, [
      1, "b", [4], {
        "c": 5,
        "d": true,
        "e": false
      }
    ]));
  });
