import test from 'ava';

import { WhiteSpaceToken, NumberToken } from '../src/known-tokens';
import { Parser } from '../src/parser';

function value(value) {
  return Object.create(null, {
    value: {
      value: value
    }
  });
}

test('calculator', t => {
  const myGrammar = new Parser({
    tokens: [WhiteSpaceToken, NumberToken],
    prefix: {
      '(': {
        nud(grammar) {
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
        combine: (left, right) => value(left.value + right.value)
      },
      '-': {
        precedence: 50,
        combine: (left, right) => value(left.value - right.value)
      },
      '*': {
        precedence: 60,
        combine: (left, right) => value(left.value * right.value)
      },
      '/': {
        precedence: 60,
        combine: (left, right) => value(left.value / right.value)
      }
    }
  });

  t.is(myGrammar.parse('1 + 41 * 3 - 2').value, 122);
});

/*
describe('calculator',
  function () {
    it('evaluates with prefix op', () => assert.equal(myGrammar.parse('(1 + 41)').value, 42));
    it('evaluates with prefix op 2', () => assert.equal(myGrammar.parse('(1 + 41) * 2').value, 84));
    it('evaluates with prefix op 3', () => assert.equal(myGrammar.parse('(1 + 1) * (2 + 7)').value, 18));
    it('evaluates with prefix op 4', () => assert.equal(myGrammar.parse('(1 + (1 + 4 * 3)) * (2 + 1)').value, 42));

    describe('unexpected token', () => {
      it('thows', () => {
        try {
          myGrammar.parse('(1 + %');
          assert.ok(false);
        } catch (e) {
          if (e.message !== '1,6: Unknown char "%"') {
            throw e;
          }
        }
      });
    });
  });
*/
