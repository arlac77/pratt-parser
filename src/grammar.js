/* jslint node: true, esnext: true */

"use strict";

if (!Object.assign) {
	Object.defineProperty(Object, 'assign', {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function (target) {
			'use strict';
			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert first argument to object');
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
			return to;
		}
	});
}

const rootToken = {
	precedence: 0,
	toString() {
		return `${this.type}: ${this.value} [${this.precedence}]`;
	},
	parseWithPrefix(token) {
		return 0;
	}
};

/**
 * token representing "end of file"
 */
const EOF = Object.create(rootToken, {
	type: {
		value: 'EOF'
	}
});

function defineGrammar(options) {
	const operators = options.operators;
	const maxOperatorLengthForFirstChar = {};
	const registeredTokens = {};

	function registerOperator(id, options) {
		const props = {
			type: {
				value: 'operator'
			},
			value: {
				value: id
			}
		};

		const op = Object.create(rootToken, props);
		Object.assign(op, options);

		registeredTokens[id] = op;
		return op;
	}

	for (let c in operators) {
		const firstChar = c[0];
		const maxLength = maxOperatorLengthForFirstChar[firstChar] || 0;

		if (maxLength < c.length) {
			maxOperatorLengthForFirstChar[firstChar] = c.length;
		}
		registerOperator(c, operators[c]);
	}

	const tokenizer = function* (chunk) {
		let lineNumber = 1;

		function error(message, values) {
			message += "," + lineNumber;
			if (values) message += ': ' + JSON.stringify(values);
			throw new Error(message);
		}

		function makeIdentifier(value) {
			return Object.create(rootToken, {
				parseWithPrefix: {
					value: function (token) {
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

		while (c = chunk[i]) {
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
									error("Unterminated string", {
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
				/*error("Unterminated string", {
					value: c
				});*/
			} else if (operatorLength = maxOperatorLengthForFirstChar[c]) {
				c = chunk.substring(i, i + operatorLength);
				if (operators[c]) {
					yield makeOperator(c);
					i += operatorLength;
				} else {
					operatorLength -= 1;
					c = chunk.substring(i, i + operatorLength);
					if (operators[c]) {
						yield makeOperator(c);
						i += operatorLength;
					} else {
						operatorLength -= 1;
						c = chunk.substring(i, i + operatorLength);
						if (operators[c]) {
							yield makeOperator(c);
							i += operatorLength;
						} else {
							error("Unknown operator", {
								value: c
							});
						}
					}
				}

			} else {
				i += 1;
				error("Unknown char", {
					value: c
				});
			}
		}
	}; // tokenizer


	const grammar = Object.create({
		tokenizer: tokenizer,
		parse(chunk) {
			const tokens = tokenizer(chunk);
			let token;

			this.advance = function advance(id) {
				if (id && token.id !== id) {
					console.log(`Expected ${id}`);
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
				let left = t;
				while (precedence < token.precedence) {
					t = token;
					grammar.advance();
					if (t.parseExpression) {
						left = t.parseExpression(grammar, left, grammar.expression(t.precedence));
					} else if (t.parseRigth) {
						left = t.parseWithPrefix(grammar, left, t.parseRigth(grammar));
					} else {
						left = t.parseWithPrefix(grammar, left);
					}
				}
				return left;
			};

			return this.expression(token.precedence);
		}
	});

	return grammar;
}

module.exports = defineGrammar;
