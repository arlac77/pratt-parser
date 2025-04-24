import test from "ava";
import { WhiteSpaceToken, NumberToken, Parser } from "pratt-parser";

function value(value) {
  return Object.create(null, {
    value: {
      value
    }
  });
}

const Calculator = new Parser({
  tokens: [WhiteSpaceToken, NumberToken],
  prefix: {
    "(": {
      nud(grammar) {
        const e = grammar.expression(0);
        grammar.advance(")");
        return e;
      }
    }
  },
  infix: {
    ")": {},
    "+": {
      precedence: 50,
      combine: (left, right) => value(left.value + right.value)
    },
    "-": {
      precedence: 50,
      combine: (left, right) => value(left.value - right.value)
    },
    "*": {
      precedence: 60,
      combine: (left, right) => value(left.value * right.value)
    },
    "/": {
      precedence: 60,
      combine: (left, right) => value(left.value / right.value)
    }
  }
});

test("calculator simple", t => {
  t.is(Calculator.parse("1 + 41 * 3 - 2").value, 122);
});

test("calculator braces", t => {
  t.is(Calculator.parse("(1 + 41)").value, 42);
  t.is(Calculator.parse("(1 + 41) * 2").value, 84);
  t.is(Calculator.parse("(1 + (1 + 4 * 3)) * (2 + 1)").value, 42);
});

test("calculator unexpected token", t => {
  function doit() {
    Calculator.parse("(1 + %");
  }

  const error = t.throws(doit);
  t.is(error.message, '1,6: Unknown char "%"');
});
