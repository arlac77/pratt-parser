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
		const maxTokenLengthForFirstChar = {};
		const registeredTokens = {};

		const consume = {
			value: function (tokenizer, chunk, offset, properties) {
				//console.log(`${chunk.substring(offset, offset+this.length)} -> ${this.value} ${this.length}`);
				return [Object.create(this, properties), this.value.length];
			}
		};


		const operatorTypes = {
			prefix: {
				token: OperatorToken,

				properties: {
					consume: consume,
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
					consume: consume,
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
					consume: consume,
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

		maxTokenLengthForFirstChar['"'] = 1;
		registeredTokens['"'] = Object.create(StringToken, {
			consume: {
				value: function (tokenizer, chunk, offset, properties) {
					const tc = chunk[offset];
					let str = '';
					let i = offset + 1;
					let c;
					for (; i < chunk.length;) {
						c = chunk[i];
						if (c === tc) {
							return [Object.create(this, Object.assign({
								value: {
									value: str
								}
							}, properties)), str.length + 2];
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
										tokenizer.error('Unterminated string', properties, {
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
					if (i === chunk.length && c !== tc) {
						tokenizer.error('Unterminated string', properties, {
							value: str
						});
					}
				}
			}
		});

		Object.defineProperty(this, 'maxTokenLengthForFirstChar', {
			value: maxTokenLengthForFirstChar
		});
		Object.defineProperty(this, 'registeredTokens', {
			value: registeredTokens
		});
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

		const length = chunk.length;

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

				case '\n':
					lineNumber += 1;
					firstCharInLine = i;
					i += 1;
					break;

				case '\b':
				case '\f':
				case '\r':
				case '\t':
				case ' ':
					i += 1;
					break;

				case undefined:
					return Object.create(EOFToken, getContextProperties());

				default:
					let t;
					for (let operatorLength = this.maxTokenLengthForFirstChar[c]; operatorLength > 0; operatorLength--) {
						const c = chunk.substring(i, i + operatorLength);
						t = this.registeredTokens[c];
						if (t) {
							const [rt, l] = t.consume(this, chunk, i, getContextProperties());
							i += l;
							yield rt;
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
