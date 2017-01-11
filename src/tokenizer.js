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

		[' '].forEach(c => {
			maxTokenLengthForFirstChar[c] = 1;
			registeredTokens[c] = WhiteSpaceToken;
		});

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
		let lineNumber = 1;
		let firstCharInLine = 0;
		let i = 0;

		const getContextProperties = () => {
			return {
				lineNumber: {
					value: lineNumber
				},
				positionInLine: {
					value: i - firstCharInLine
				}
			};
		};

		do {
			let c = chunk[i];

			let tokenLength = this.maxTokenLengthForFirstChar[c];

			if (tokenLength) {
				do {
					const t = this.registeredTokens[chunk.substring(i, i + tokenLength)];
					if (t) {
						const [rt, l] = t.parseString(this, chunk, i, getContextProperties());

						console.log(`${chunk.substring(i, i + tokenLength)} -> ${rt}`);
						i += l;
						if (rt) {
							yield rt;
						}
						break;
					}
				} while (tokenLength-- > 1);

				continue;
			} else {
				if (c === '\n') {
					lineNumber += 1;
					firstCharInLine = i;
					i += 1;

					continue;
				}

				if (c === undefined) {
					return Object.create(EOFToken, getContextProperties());
				}

				i += 1;

				this.error('Unknown char', {
					lineNumber, positionInLine: i - firstCharInLine, value: c
				});
			}
		}
		while (true);
	}

	/**
	 * @param {string} message
	 * @param {object} context token initiating the error
	 * @param {object} [values]
	 * @return {Object} error
	 */
	error(message, context, values) {
		message = `${context.lineNumber},${context.positionInLine}: ${message}`;
		if (values) message += ': ' + JSON.stringify(values);
		throw new Error(message);
	}
}
