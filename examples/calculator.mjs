#!/usr/bin/env node
import { WhiteSpaceToken, NumberToken, Parser } from "pratt-parser";
import { argv } from "node:process";

function value(value) {
  return Object.create(null, {
    value: {
      value: value
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


const input = argv.slice(2).join(' ');
console.log(Calculator.parse(input).value);