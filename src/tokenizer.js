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
		const length = chunk.length;

		while ((c = chunk[i]) !== undefined) {
			switch (c) {
				case '_':
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				case 'E':
				case 'F':
				case 'G':
				case 'H':
				case 'I':
				case 'J':
				case 'K':
				case 'L':
				case 'M':
				case 'N':
				case 'O':
				case 'P':
				case 'Q':
				case 'R':
				case 'S':
				case 'T':
				case 'U':
				case 'V':
				case 'W':
				case 'X':
				case 'Y':
				case 'Z':
				case 'a':
				case 'b':
				case 'c':
				case 'd':
				case 'e':
				case 'f':
				case 'g':
				case 'h':
				case 'i':
				case 'j':
				case 'k':
				case 'l':
				case 'm':
				case 'n':
				case 'o':
				case 'p':
				case 'q':
				case 'r':
				case 's':
				case 't':
				case 'u':
				case 'v':
				case 'w':
				case 'x':
				case 'y':
				case 'z':
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
					break;

				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
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
					break;

				case '"':
				case "'":
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
					break;

				case '\n':
					lineNumber += 1;
					firstCharInLine = i;
					i += 1;
					c = chunk[i];
					break;

				case '\b':
				case '\f':
				case '\r':
				case '\t':
				case ' ':
					i += 1;
					c = chunk[i];
					break;

				default:
					let operatorLength = this.maxOperatorLengthForFirstChar[c];
					if (operatorLength > 0) {
						do {
							const c = chunk.substring(i, i + operatorLength);
							const t = this.registeredTokens[c];
							if (t) {
								i += operatorLength;
								yield Object.create(t, getContextProperties());
								break;
							}
						} while (--operatorLength > 0);
					} else {
						i += 1;
						this.error('Unknown char', getContext(), {
							value: c
						});
					}
			}
		}
	}
}
