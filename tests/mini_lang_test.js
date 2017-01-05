/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  Parser
} = require('../dist/parser');

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

    const functions = {
      concat: args => Value(args.map(a => a.value).join('')),
      noargs: args => Value('-- no args --'),
      onearg: args => args[0]
    };

    const myGrammar = new Parser({
      identifier(value, properties, context) {
          if (functions[value]) {
            properties.value.value = functions[value];
          } else if (identifiers[value]) {
            properties.value.value = identifiers[value];
          }
          //console.log(`create identifier: ${value} ${context}`);
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

                return left.value(args);
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
              grammar.advance(']');
              return Value(left.value[right.value]);
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
    it('evaluates function no args', () => assert.equal(myGrammar.parse('noargs()', 'norags context').value,
      '-- no args --'));
    it('evaluates function one arg', () => assert.equal(myGrammar.parse('onearg("the arg")').value, 'the arg'));
    it('evaluates function', () => assert.equal(myGrammar.parse('concat("A","B")').value, 'AB'));
    it('evaluates function 2', () => assert.equal(myGrammar.parse('concat(concat("A","B"),"C")').value, 'ABC'));
  });
