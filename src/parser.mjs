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
   * @param {Object} [options]
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
    // @ts-ignore
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
        this.error(`Got '${this.token.value}' expected '${id}'`, this.token);
      }

      const next = tokens.next();
      this.token = next.done ? EOFToken : next.value;

      return this.token;
    };

    this.advance();

    this.expression = precedence => {
      let token = this.token;
      this.advance();
      let left = token.nud(this);

      while (precedence < this.token.precedence) {
        token = this.token;
        this.advance();
        left = token.led(this, left);
      }

      return left;
    };

    return this.expression(this.token.precedence);
  }
}
