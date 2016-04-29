/* jslint node: true, esnext: true */

'use strict';

const rootToken = {
	precedence: 0,
	toString() {
		return `${this.type}: ${this.value} [${this.precedence}]`;
	},
	led(grammar, left) {
		console.log(`led: ${left}`);
		return left;
	},
	nud(grammar) {
		return this;
	},
	combine() {
		return 0;
	}
};

/**
 * Token representing 'end of file'
 */
const EOF = Object.create(rootToken, {
	type: {
		value: 'EOF'
	}
});

/**
 * Creates a grammar for later parsing
 * @param {Object} options
 * @return {Object} parser
 */
function createGrammar(options) {
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

		const op = Object.create(rootToken, props);
		Object.assign(op, options);

		registeredTokens[id] = op;
		return op;
	}

	for (const operatorTypeName in operatorTypes) {
		const ops = options[operatorTypeName];
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

	const tokenizer = function* (chunk) {
		let lineNumber = 1;

		function error(message, values) {
			message += ',' + lineNumber;
			if (values) message += ': ' + JSON.stringify(values);
			throw new Error(message);
		}

		function makeIdentifier(value) {
			return Object.create(rootToken, {
				parseWithPrefix: {
					value: token => {
						console.log(`got identifier: ${token.value}`);
						return 0;
					}
				},
				type: {
					value: 'identifier'
				},
				value: {
					value: value
				},
				lineNumber: {
					value: lineNumber
				}
			});
		}

		function makeOperator(value) {
			return Object.create(registeredTokens[value], {
				lineNumber: {
					value: lineNumber
				}
			});
		}

		function makeNumber(value) {
			return Object.create(rootToken, {
				type: {
					value: 'number'
				},
				value: {
					value: value
				},
				lineNumber: {
					value: lineNumber
				}
			});
		}

		function makeString(value) {
			return Object.create(rootToken, {
				type: {
					value: 'string'
				},
				value: {
					value: value
				},
				lineNumber: {
					value: lineNumber
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
				}
			});
		}

		let c, str;
		let firstCharInLine = 0;
		let i = 0;
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
					if (c < '0' || c > '9') {
						break;
					}
					i += 1;
					str += c;
				}

				yield makeNumber(+str);
			} else if (c === '"') {
				i += 1;
				str = '';
				for (; i < length;) {
					c = chunk[i];
					if (c === '"') {
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
										value: c
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
				/*error('Unterminated string', {
					value: c
				});*/
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
						} else {
							error('Unknown operator', {
								value: c
							});
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

	const grammar = Object.create({
		tokenizer: tokenizer,

		/**
		 * Parses the input and delivers the outermoost expression.
		 * @param {String} chunk input text
		 * @return {Object} evaluated input
		 */
		parse(chunk) {
			const tokens = tokenizer(chunk);
			let token;

			this.advance = function (id) {
				if (id !== undefined && token.id !== undefined && token.id !== id) {
					console.log(`Got ${token.id} expected ${id}`);
				}

				const n = tokens.next();

				if (n.done) {
					token = EOF;
					return token;
				}
				token = n.value;
				return token;
			};

			token = this.advance();

			this.expression = function (precedence) {
				let t = token;
				grammar.advance();
				let left = t.nud(grammar);

				while (precedence < token.precedence) {
					t = token;
					grammar.advance();
					left = t.led(grammar, left);
				}

				return left;
			};

			return this.expression(token.precedence);
		}
	});

	return grammar;
}

exports.createGrammar = createGrammar;
