/* jslint node: true, esnext: true */

'use strict';

import {
	EOFToken
}
from './known_tokens';

import {
	Tokenizer
}
from './tokenizer';

/**
 * @module pratt-parser
 */

export class Parser {

	/**
	 * Creates a grammar for later parsing
	 * @param {object} grammar definition of the grammar with operators...
	 * @return {object} parser
	 */
	constructor(grammar, options = {}) {
		Object.defineProperty(this, 'tokenizer', {
			value: options.tokenizer ||  new Tokenizer(grammar)
		});
	}

	error(message, context) {
		return this.tokenizer.error(message, context);
	}

	/**
	 * Parses the input and delivers the outermoost expression.
	 * @param {string} chunk input text
	 * @param {object} context object transparently passed to tokenizer
	 * @return {object} evaluated input
	 */
	parse(chunk, context) {
		this.context = context;

		const tokens = this.tokenizer.tokens(chunk, context);

		this.advance = id => {
			if (id !== undefined && this.token.value !== undefined && this.token.value !== id) {
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

export {
	Tokenizer
};
