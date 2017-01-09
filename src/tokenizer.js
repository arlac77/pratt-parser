/* jslint node: true, esnext: true */

'use strict';

import {
	EOFToken, StringToken, NumberToken, OperatorToken, IdentifierToken, KeywordToken
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
				token: OperatorToken,
				nud(grammar) {
					return this.combine(grammar.expression(this.precedence));
				}
			},
			infix: {
				token: OperatorToken,
				led(grammar, left) {
					return this.combine(left, grammar.expression(this.precedence));
				}
			},
			infixr: {
				token: OperatorToken,
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

			const op = Object.assign(Object.create(operatorType.token, props), options);

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

	makeIdentifier(chunk, offset, context, contextProperties) {
		let i = offset;
		i += 1;
		for (;;) {
			const c = chunk[i];
			if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
				(c >= '0' && c <= '9') || c === '_') {
				i += 1;
			} else {
				break;
			}
		}

		contextProperties.value = {
			value: chunk.substring(offset, i)
		};
		return [Object.create(IdentifierToken, contextProperties), i - offset];
	}

	/**
	 * delivers tokens from the input
	 */
	* tokens(chunk, context) {
		let lineNumber = 1;
		let firstCharInLine = 0;

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

		const length = chunk.length;

		let i = 0;

		do {
			let c = chunk[i];
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
					{
						const [t, l] = this.makeIdentifier(chunk, i, context, getContextProperties());
						i += l;
						yield t;
					}
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
					{
						let str = c;
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
					}
					break;

				case '"':
				case "'":
					{
						const tc = c;
						let str = '';

						i += 1;
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

				case undefined:
					return Object.create(EOFToken, getContextProperties());

				default:
					let t;
					for (let operatorLength = this.maxOperatorLengthForFirstChar[c]; operatorLength > 0; operatorLength--) {
						const c = chunk.substring(i, i + operatorLength);
						t = this.registeredTokens[c];
						if (t) {
							i += operatorLength;
							yield Object.create(t, getContextProperties());
							break;
						}
					}
					if (!t) {
						i += 1;
						this.error('Unknown char', getContext(), {
							value: c
						});
					}
			}
		}
		while (true);
	}
}
