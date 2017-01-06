/* jslint node: true, esnext: true */

'use strict';

import {
	EOFToken, StringToken, NumberToken, OperatorToken, IdentifierToken
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
		const maxOperatorLengthForFirstChar = {};
		const registeredTokens = {};

		const operatorTypes = {
			prefix: {
				nud(grammar) {
					return this.combine(grammar.expression(this.precedence));
				}
			},
			infix: {
				led(grammar, left) {
					return this.combine(left, grammar.expression(this.precedence));
				}
			},
			infixr: {
				led(grammar, left) {
					return this.combine(left, grammar.expression(this.precedence - 1));
				}
			}
		};

		function registerOperator(id, options, operatorType) {
			const props = {
				value: {
					value: id
				}
			};

			if (operatorType.led) {
				props.led = {
					value: operatorType.led,
					writable: true
				};
			}

			const op = Object.assign(Object.create(OperatorToken, props), options);

			registeredTokens[id] = op;
			return op;
		}

		for (const operatorTypeName in operatorTypes) {
			const ops = grammar[operatorTypeName];
			const operatorType = operatorTypes[operatorTypeName];

			for (const c in ops) {
				const firstChar = c[0];
				const maxLength = maxOperatorLengthForFirstChar[firstChar] || 0;

				if (maxLength < c.length) {
					maxOperatorLengthForFirstChar[firstChar] = c.length;
				}
				registerOperator(c, ops[c], operatorType);
			}
		}

		Object.defineProperty(this, 'maxOperatorLengthForFirstChar', {
			value: maxOperatorLengthForFirstChar
		});
		Object.defineProperty(this, 'registeredTokens', {
			value: registeredTokens
		});

		this._identifier = grammar.identifier || function () {};
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

	makeIdentifier(value, context, contextProperties) {
		contextProperties.value = {
			value: value
		};
		this._identifier(value, contextProperties, context);
		return Object.create(IdentifierToken, contextProperties);
	}

	* tokens(chunk, context) {
		let lineNumber = 1;
		let firstCharInLine = 0;
		let i = 0;

		const getContext = () => {
			return {
				lineNumber, positionInLine: i - firstCharInLine
			};
		};

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

		let c, str;
		let op, operatorLength;
		const length = chunk.length;

		while ((c = chunk[i]) !== undefined) {
			if (c <= ' ') {
				if (c === '\n') {
					lineNumber += 1;
					firstCharInLine = i;
				}
				i += 1;
				c = chunk[i];
			} else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
				str = c;
				i += 1;
				for (;;) {
					c = chunk[i];
					if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
						(c >= '0' && c <= '9') || c === '_') {
						str += c;
						i += 1;
					} else {
						break;
					}
				}

				yield this.makeIdentifier(str, context, getContextProperties());
			} else if (c >= '0' && c <= '9') {
				str = c;
				i += 1;
				for (; i < length;) {
					c = chunk[i];
					if ((c < '0' || c > '9') && c !== '.' && c !== 'e' && c !== 'E') {
						break;
					}
					i += 1;
					str += c;
				}
				yield Object.create(NumberToken, Object.assign(getContextProperties(), {
					value: {
						value: +str
					}
				}));
			} else if (c === '"' || c === "'") {
				const tc = c;
				i += 1;
				str = '';
				for (; i < length;) {
					c = chunk[i];
					if (c === tc) {
						i += 1;
						yield Object.create(StringToken, Object.assign(getContextProperties(), {
							value: {
								value: str
							}
						}));
						break;
					} else if (c === '\\') {
						i += 1;
						c = chunk[i];
						switch (c) {
							case 'b':
								c = '\b';
								break;
							case 'f':
								c = '\f';
								break;
							case 'n':
								c = '\n';
								break;
							case 'r':
								c = '\r';
								break;
							case 't':
								c = '\t';
								break;
							case 'u':
								c = parseInt(chunk.substr(i + 1, 4), 16);
								if (!isFinite(c) || c < 0) {
									this.error('Unterminated string', getContext(), {
										value: str
									});
								}
								c = String.fromCharCode(c);
								i += 4;
								break;
						}
						str += c;
						i += 1;
					} else {
						str += c;
						i += 1;
					}
				}
				if (i === length && c !== tc) {
					this.error('Unterminated string', getContext(), {
						value: str
					});
				}
			} else if ((operatorLength = this.maxOperatorLengthForFirstChar[c]) !== undefined) {
				let t;
				c = chunk.substring(i, i + operatorLength);
				t = this.registeredTokens[c];
				if (t) {
					yield Object.create(t, getContextProperties());
					i += operatorLength;
				} else {
					operatorLength -= 1;
					c = chunk.substring(i, i + operatorLength);
					t = this.registeredTokens[c];
					if (t) {
						yield Object.create(t, getContextProperties());
						i += operatorLength;
					} else {
						operatorLength -= 1;
						c = chunk.substring(i, i + operatorLength);
						t = this.registeredTokens[c];
						if (t) {
							yield Object.create(t, getContextProperties());
							i += operatorLength;
						}
					}
				}
			} else {
				i += 1;
				this.error('Unknown char', getContext(), {
					value: c
				});
			}
		}
	}
}
