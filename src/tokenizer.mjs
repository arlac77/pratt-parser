import { EOFToken, OperatorToken } from "./known-tokens.mjs";

const rootPP = {
  chunk: undefined,
  context: {},
  firstCharInLine: 0,
  lineNumber: 1,
  offset: 0,
  get positionInLine() {
    return this.offset - this.firstCharInLine;
  },
  get properties() {
    return {
      lineNumber: {
        value: this.lineNumber
      },
      positionInLine: {
        value: this.positionInLine
      }
    };
  }
};

/**
 * Creates a tokenizer for later parsing.
 * @param {Object} grammar definition of the grammar with operators...
 */
export class Tokenizer {
  maxTokenLengthForFirstChar = {};
  registeredTokens = {};

  constructor(grammar) {
    const operatorTypes = {
      prefix: {
        token: OperatorToken,

        properties: {
          nud: {
            value(grammar, left) {
              return this.combine(left, grammar.expression(this.precedence));
            },
            writable: true
          }
        }
      },
      infix: {
        token: OperatorToken,

        properties: {
          led: {
            value(grammar, left) {
              return this.combine(left, grammar.expression(this.precedence));
            },
            writable: true
          }
        }
      },
      infixr: {
        token: OperatorToken,

        properties: {
          led: {
            value(grammar, left) {
              return this.combine(
                left,
                grammar.expression(this.precedence - 1)
              );
            },
            writable: true
          }
        }
      }
    };

    for (const operatorTypeName in operatorTypes) {
      const ops = grammar[operatorTypeName];
      const operatorType = operatorTypes[operatorTypeName];

      for (const c in ops) {
        operatorType.properties.value = {
          value: c
        };

        Object.assign(
          Object.create(operatorType.token, operatorType.properties),
          ops[c]
        ).registerWithinTokenizer(this);
      }
    }

    grammar.tokens?.forEach(token => token.registerWithinTokenizer(this));
  }

  /**
   * delivers tokens from the input.
   * @param {string} chunk the input to be processed
   * @param {Object} context additional info to be used by the actual token types
   */
  *tokens(chunk, context) {
    const pp = Object.create(rootPP);
    pp.context = context;
    pp.chunk = chunk;
    pp.tokenizer = this;

    do {
      const c = pp.chunk[pp.offset];
      let tokenLength = this.maxTokenLengthForFirstChar[c];

      if (tokenLength > 0) {
        do {
          const t =
            this.registeredTokens[
              pp.chunk.slice(pp.offset, pp.offset + tokenLength)
            ];
          if (t !== undefined) {
            const rt = t.parseString(pp);

            if (rt !== undefined) {
              yield rt;
            }
            break;
          }
        } while (tokenLength-- > 1);
      } else {
        if (c === undefined) {
          return Object.create(EOFToken, pp.properties);
        }

        pp.offset += 1;

        this.error("Unknown char", pp, c);
      }
    } while (true);
  }

  /**
   * @param {string} message
   * @param {Object} context token initiating the error
   * @param {Object} [value]
   * @return {Object} error
   */
  error(message, context, value) {
    message = `${context.lineNumber},${context.positionInLine}: ${message} "${value}"`;
    throw new Error(message);
  }
}
