import { EOFToken } from "./known-tokens.mjs";
import { Tokenizer } from "./tokenizer.mjs";

export * from "./known-tokens.mjs";
export { Tokenizer };

/**
 * Creates a grammar for later parsing
 * @param {Object} grammar definition of the grammar with operators...
 */
export class Parser {
  tokenizer;
  context;
  
  /**
   * 
   * @param {any} grammar 
   * @param {Object} options
   * @param {Tokenizer} options.tokenizer
   */
  constructor(grammar, options) {
    this.tokenizer = options?.tokenizer || new Tokenizer(grammar);
  }

  /**
   * Forwards error to the tokenizer
   * @return {Object} error
   */
  error(...args) {
    return this.tokenizer.error(...args);
  }

  /**
   * Parses the input and delivers the outermoost expression.
   * @param {string} chunk input text
   * @param {Object} context object transparently passed to tokenizer
   * @return {Object} evaluated input
   */
  parse(chunk, context) {
    this.context = context;

    const tokens = this.tokenizer.tokens(chunk, context);

    this.advance = id => {
      if (
        id !== undefined &&
        this.token.value !== undefined &&
        this.token.value !== id
      ) {
        this.error(`Got ${this.token.value} expected ${id}`, this.token);
      }

      const n = tokens.next();
      this.token = n.done ? EOFToken : n.value;
      return this.token;
    };

    this.token = this.advance();

    this.expression = precedence => {
      let t = this.token;
      this.advance();
      let left = t.nud(this);

      while (precedence < this.token.precedence) {
        t = this.token;
        this.advance();
        left = t.led(this, left);
      }

      return left;
    };

    return this.expression(this.token.precedence);
  }
}
