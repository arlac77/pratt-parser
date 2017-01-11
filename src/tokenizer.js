/* jslint node: true, esnext: true */

'use strict';

import {
	EOFToken, WhiteSpaceToken, StringToken, NumberToken, OperatorToken, IdentifierToken, KeywordToken
}
from './known_tokens';

/**
 * @module pratt-parser
 */

export class Tokenizer {

	/**
	 * Creates a tokenizer for later parsing
	 * @param {object} grammar definition of the grammar with operators...
	 */
	constructor(grammar) {
		const maxTokenLengthForFirstChar = {};
		const registeredTokens = {};

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

		function registerOperator(id, type, options) {
			type.properties.value = {
				value: id
			};

			registeredTokens[id] = Object.assign(Object.create(type.token, type.properties), options);
		}

		for (const operatorTypeName in operatorTypes) {
			const ops = grammar[operatorTypeName];
			const operatorType = operatorTypes[operatorTypeName];

			for (const c in ops) {
				const firstChar = c[0];
				const maxLength = maxTokenLengthForFirstChar[firstChar] || 0;

				if (maxLength < c.length) {
					maxTokenLengthForFirstChar[firstChar] = c.length;
				}
				registerOperator(c, operatorType, ops[c]);
			}
		}

		for (const c of " \f\t\b\r\n") {
			maxTokenLengthForFirstChar[c] = 1;
			registeredTokens[c] = WhiteSpaceToken;
		}

		["'", '"'].forEach(c => {
			maxTokenLengthForFirstChar[c] = 1;
			registeredTokens[c] = StringToken;
		});

		for (const c of "0123456789") {
			maxTokenLengthForFirstChar[c] = 1;
			registeredTokens[c] = NumberToken;
		}

		for (const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_") {
			maxTokenLengthForFirstChar[c] = 1;
			registeredTokens[c] = IdentifierToken;
		}

		if (grammar.tokens) {
			grammar.tokens.forEach(token => {
				for (const c of token.firstChar) {
					maxTokenLengthForFirstChar[c] = 1;
					registeredTokens[c] = token.token;
				}
			});
		}

		Object.defineProperty(this, 'maxTokenLengthForFirstChar', {
			value: maxTokenLengthForFirstChar
		});
		Object.defineProperty(this, 'registeredTokens', {
			value: registeredTokens
		});
	}

	/**
	 * delivers tokens from the input
	 */
	* tokens(chunk, context) {
		const pp = {
			chunk, firstCharInLine: 0, lineNumber: 1, offset: 0, get positionInLine() {
				return this.offset - this.firstCharInLine;
			}
		};

		const getContextProperties = () => {
			return {
				lineNumber: {
					value: pp.lineNumber
				},
				positionInLine: {
					value: pp.offset - pp.firstCharInLine
				}
			};
		};

		do {
			let c = pp.chunk[pp.offset];

			let tokenLength = this.maxTokenLengthForFirstChar[c];

			if (tokenLength) {
				do {
					const t = this.registeredTokens[pp.chunk.substring(pp.offset, pp.offset + tokenLength)];
					if (t) {
						const l = pp.offset;
						const rt = t.parseString(this, pp, getContextProperties());
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
					return Object.create(EOFToken, getContextProperties());
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
