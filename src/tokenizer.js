/* jslint node: true, esnext: true */

'use strict';

import {
	EOFToken, WhiteSpaceToken, StringToken, NumberToken, OperatorToken, IdentifierToken, KeywordToken
}
from './known_tokens';


/**
 * @module pratt-parser
 */

 const rootPP = {
	 chunk: undefined,
	 context: {},
	 firstCharInLine: 0,
	 lineNumber: 1, offset: 0,
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

export class Tokenizer {

	/**
	 * Creates a tokenizer for later parsing
	 * @param {object} grammar definition of the grammar with operators...
	 */
	constructor(grammar) {
		const maxTokenLengthForFirstChar = {};
		const registeredTokens = {};

		Object.defineProperty(this, 'maxTokenLengthForFirstChar', {
			value: maxTokenLengthForFirstChar
		});
		Object.defineProperty(this, 'registeredTokens', {
			value: registeredTokens
		});

		const operatorTypes = {
			prefix: {
				token: OperatorToken,

				properties: {
					nud: {
						value: function (grammar, left) {
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
						value: function (grammar, left) {
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
						value: function (grammar, left) {
							return this.combine(left, grammar.expression(this.precedence - 1));
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

				Object.assign(Object.create(operatorType.token, operatorType.properties), ops[c]).registerWithinTokenizer(this);
			}
		}

		if (grammar.tokens) {
			grammar.tokens.forEach(token => token.registerWithinTokenizer(this));
		}
	}


	/**
	 * delivers tokens from the input
	 */
	* tokens(chunk, context) {
		const pp = Object.create(rootPP);
		pp.context = context;
		pp.chunk = chunk;

		do {
			const c = pp.chunk[pp.offset];
			let tokenLength = this.maxTokenLengthForFirstChar[c];

			if (tokenLength) {
				do {
					const t = this.registeredTokens[pp.chunk.substring(pp.offset, pp.offset + tokenLength)];
					if (t) {
						const l = pp.offset;
						const rt = t.parseString(this, pp, pp.properties);
						//console.log(`${pp.chunk.substring(l, pp.offset)} -> ${rt} ${rt ? rt.value : ''}`);

						if (rt) {
							yield rt;
						}
						break;
					}
				} while (tokenLength-- > 1);

				continue;
			} else {
				if (c === undefined) {
					return Object.create(EOFToken, pp.properties);
				}

				pp.offset += 1;

				this.error('Unknown char', pp, c);
			}
		}
		while (true);
	}

	/**
	 * @param {string} message
	 * @param {object} context token initiating the error
	 * @param {object} [value]
	 * @return {Object} error
	 */
	error(message, context, value) {
		message = `${context.lineNumber},${context.positionInLine}: ${message} "${value}"`;
		throw new Error(message);
	}
}
