/* jslint node: true, esnext: true */

'use strict';

import {
	EOF, rootToken
}
from './util';

import {
	createTokenizer
}
from './tokenizer';

/**
 * @module pratt-parser
 */

/**
 * Creates a grammar for later parsing
 * @param {object} grammar definition of the grammar with operators...
 * @return {object} parser
 */
export function create(grammar) {
	const tokenizer = createTokenizer(grammar);

	return Object.create({
		tokenizer: tokenizer,

		/**
		 * Parses the input and delivers the outermoost expression.
		 * @param {string} chunk input text
		 * @param {object} context object transparently passed to tokenizer
		 * @return {object} evaluated input
		 */
		parse(chunk, context) {
			this.context = context;

			const tokens = tokenizer(chunk, context);

			this.advance = id => {
				if (id !== undefined && this.token.value !== undefined && this.token.value !== id) {
					throw new Error(`Got ${this.token.value} expected ${id}`);
				}

				const n = tokens.next();
				this.token = n.done ? EOF : n.value;
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
	});
}
