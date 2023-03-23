import { Parser, WhiteSpaceToken, NumberToken } from "pratt-parser";

function Value(value) {
  return { value };
}

const myGrammar = new Parser({
  tokens: [WhiteSpaceToken, NumberToken],
  infix: {
    ")": {},
    "+": {
      precedence: 50,
      combine: (left, right) => Value(left.value + right.value)
    },
    "-": {
      precedence: 50,
      combine: (left, right) => Value(left.value - right.value)
    },
    "*": {
      precedence: 60,
      combine: (left, right) => Value(left.value * right.value)
    },
    "/": {
      precedence: 60,
      combine: (left, right) => Value(left.value / right.value)
    }
  }
});
console.log(myGrammar.parse(process.argv.slice(2)).value)