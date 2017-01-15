/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  Parser, Tokenizer, IdentifierToken, KeywordToken
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

    const g = {
      tokens: [
        Object.create(KeywordToken, {
          keywords: {
            values: ['true', 'false']
          }
        }), Object.create(IdentifierToken, {
          firstChar: {
            value: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_"
          },
          parseString: {
            value: function (tokenizer, pp, properties) {
              let i = pp.offset + 1;
              for (;;) {
                const c = pp.chunk[i];
                if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                  (c >= '0' && c <= '9') || c === '_') {
                  i += 1;
                } else {
                  break;
                }
              }
              const value = pp.chunk.substring(pp.offset, i);

              if (value === 'true') {
                properties.value = {
                  value: true
                };
              } else if (value === 'false') {
                properties.value = {
                  value: false
                };
              } else {
                properties.value = {
                  value: value
                };
              }

              pp.offset = i;
              return Object.create(this, properties);
            }
          }
        }),
      ],

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

    const myGrammar = new Parser(g);

    it('simple array', () => assert.deepEqual(myGrammar.parse('[1,"b",[4],{ "c" : 5, "d" : true, "e": false}]').value, [
      1, "b", [4], {
        "c": 5,
        "d": true,
        "e": false
      }
    ]));
  });
