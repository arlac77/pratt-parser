import test from "ava";
import {
  Parser,
  IdentifierToken,
  WhiteSpaceToken,
  NumberToken,
  StringToken
} from "pratt-parser";

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
  concat: args => Value(args.map(a => a.value).join("")),
  noargs: args => Value("-- no args --"),
  onearg: args => args[0]
};

const g = {
  tokens: [
    WhiteSpaceToken,
    NumberToken,
    StringToken,

    Object.create(IdentifierToken, {
      parseString: {
        value(pp) {
          let i = pp.offset + 1;
          for (;;) {
            const c = pp.chunk[i];
            if (
              (c >= "a" && c <= "z") ||
              (c >= "A" && c <= "Z") ||
              (c >= "0" && c <= "9") ||
              c === "_"
            ) {
              i += 1;
            } else {
              break;
            }
          }
          const value = pp.chunk.substring(pp.offset, i);

          const properties = pp.properties;

          if (functions[value]) {
            properties.value = {
              value: functions[value]
            };
          } else if (identifiers[value]) {
            properties.value = {
              value: identifiers[value]
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
    })
  ],
  prefix: {
    "(": {
      precedence: 80,
      led(grammar, left) {
        if (left.type === "identifier") {
          const args = [];

          if (grammar.token.value !== ")") {
            while (true) {
              args.push(grammar.expression(0));

              if (grammar.token.value !== ",") {
                break;
              }
              grammar.advance(",");
            }
          }

          grammar.advance(")");

          return left.value(args);
        } else {
          const e = grammar.expression(0);
          grammar.advance(")");
          return e;
        }
      }
    }
  },
  infix: {
    ",": {},
    ")": {},
    "]": {},
    "[": {
      precedence: 40,
      led(grammar, left) {
        const right = grammar.expression(0);
        grammar.advance("]");
        return Value(left.value[right.value]);
      }
    },
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
};

test("mini_lang noargs", t => {
  const myGrammar = new Parser(g);
  t.is(myGrammar.parse("noargs()").value, "-- no args --");
});

test("mini_lang onearg", t => {
  const myGrammar = new Parser(g);
  t.is(myGrammar.parse('onearg("the arg")').value, "the arg");
});

test("mini_lang concat", t => {
  const myGrammar = new Parser(g);
  t.is(myGrammar.parse('concat("A","B")').value, "AB");
  t.is(myGrammar.parse('concat(concat("A","B"),"C")').value, "ABC");
});

test("mini_lang array", t => {
  const myGrammar = new Parser(g);
  t.is(myGrammar.parse("array[3 * 2] + 2").value, 9);
});
