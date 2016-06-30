/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const createGrammar = require('../lib/grammar').createGrammar;

describe('mini_lang',
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
        number: {},
        identifier: {}
      },
      prefix: {
        '(': {
          precedence: 80,
          led(grammar, left) {
            if (left.type === 'identifier') {
              const args = [];

              if (grammar.token.value !== ')') {
                while (true) {
                  args.push(grammar.expression(0));

                  if (grammar.token.value !== ',') {
                    break;
                  }
                  grammar.advance(',');
                }
              }

              grammar.advance(')');

              if (left.value === 'concat') {
                return Value(args.map(a => a.value).join(''));
              }
              if (left.value === 'noargs') {
                return Value('-- no args --');
              }
              if (left.value === 'onearg') {
                return args[0];
              }
            } else {
              const e = grammar.expression(0);
              grammar.advance(')');
              return e;
            }
          }
        }
      },
      infix: {
        ',': {},
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
          combine: (left, right) => Value(left.value + right.value)
        },
        '-': {
          precedence: 50,
          combine: (left, right) => Value(left.value - right.value)
        },
        '*': {
          precedence: 60,
          combine: (left, right) => Value(left.value * right.value)
        },
        '/': {
          precedence: 60,
          combine: (left, right) => Value(left.value / right.value)
        }
      }
    });

    it('evaluates array', () => assert.equal(myGrammar.parse('array[3 * 2] + 2').value, 9));
    it('evaluates function no args', () => assert.equal(myGrammar.parse('noargs()').value, '-- no args --'));
    it('evaluates function one arg', () => assert.equal(myGrammar.parse('onearg("the arg")').value, 'the arg'));
    it('evaluates function', () => assert.equal(myGrammar.parse('concat("A","B")').value, 'AB'));
  });
