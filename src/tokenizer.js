/* jslint node: true, esnext: true */

'use strict';

import {
	EOF, rootToken
}
from './util';

/**
 * @module pratt-parser
 */

/*
 class Tokenizer {
 	constructor(grammar) {
 	}
 	
 	error(message) {}

 	*tokens() {
 	}
 }
*/

/**
 * Creates a tokenizer for later parsing
 * @param {object} grammar definition of the grammar with operators...
 * @return {function} tokenizer
 */
export function createTokenizer(grammar) {
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
			type: {
				value: 'operator'
			},
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

		const op = Object.assign(Object.create(rootToken, props), options);

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

	return function* (chunk, context) {
		let lineNumber = 1;
		let firstCharInLine = 0;
		let i = 0;

		function error(message, values) {
			message += `,${lineNumber},${i - firstCharInLine}`;
			if (values) message += ': ' + JSON.stringify(values);
			throw new Error(message);
		}

		function makeIdentifier(value) {
			const properties = {
				type: {
					value: 'identifier'
				},
				value: {
					value: value
				},
				lineNumber: {
					value: lineNumber
				},
				positionInLine: {
					value: i - firstCharInLine
				}
			};
			if (grammar.identifier) {
				grammar.identifier(value, properties, context);
			}
			return Object.create(rootToken, properties);
		}

		function makeOperator(value) {
			return Object.create(registeredTokens[value], {
				lineNumber: {
					value: lineNumber
				},
				positionInLine: {
					value: i - firstCharInLine
				}
			});
		}

		function makeToken(type, value) {
			return Object.create(rootToken, {
				type: {
					value: type
				},
				value: {
					value: value
				},
				lineNumber: {
					value: lineNumber
				},
				positionInLine: {
					value: i - firstCharInLine
				}
			});
		}

		function makeString(value) {
			return makeToken('string', value);
		}

		function makeNumber(value) {
			return makeToken('number', value);
		}

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

				yield makeIdentifier(str);
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
				yield makeNumber(+str);
			} else if (c === '"' || c === "'") {
				const tc = c;
				i += 1;
				str = '';
				for (; i < length;) {
					c = chunk[i];
					if (c === tc) {
						i += 1;
						yield makeString(str);
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
									error('Unterminated string', {
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
					error('Unterminated string', {
						value: str
					});
				}
			} else if ((operatorLength = maxOperatorLengthForFirstChar[c]) !== undefined) {
				c = chunk.substring(i, i + operatorLength);
				if (registeredTokens[c]) {
					yield makeOperator(c);
					i += operatorLength;
				} else {
					operatorLength -= 1;
					c = chunk.substring(i, i + operatorLength);
					if (registeredTokens[c]) {
						yield makeOperator(c);
						i += operatorLength;
					} else {
						operatorLength -= 1;
						c = chunk.substring(i, i + operatorLength);
						if (registeredTokens[c]) {
							yield makeOperator(c);
							i += operatorLength;
						}
					}
				}
			} else {
				i += 1;
				error('Unknown char', {
					value: c
				});
			}
		}
	}; // tokenizer
}
