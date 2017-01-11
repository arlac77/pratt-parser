/* jslint node: true, esnext: true */

'use strict';

/**
 * @module pratt-parser
 */

export const RootToken = {
	precedence: 0,
	type: 'unknown',
	value: undefined,
	parseString() {
		return [undefined, 0];
	},
	toString() {
		return `${this.type}: ${this.value} [${this.precedence}]`;
	},
	led(grammar, left) {
		return left;
	},
	nud(grammar) {
		return this;
	},
	combine() {
		return 0;
	}
};

export const IdentifierToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, pp, properties) {
			let i = pp.offset + 1;
			for (;;) {
				const c = pp.chunk[i];
				if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
					(c >= '0' && c <= '9') || c === '_') {
					i += 1;
				} else {
					break;
				}
			}

			properties.value = {
				value: pp.chunk.substring(pp.offset, i)
			};
			pp.offset = i;
			return Object.create(this, properties);
		}
	},

	type: {
		value: 'identifier'
	}
});

export const KeywordToken = Object.create(IdentifierToken, {
	type: {
		value: 'keyword'
	}
});

export const StringToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, pp, properties) {
			const tc = pp.chunk[pp.offset];
			let str = '';
			let i = pp.offset + 1;
			let c;
			for (; i < pp.chunk.length;) {
				c = pp.chunk[i];
				if (c === tc) {
					pp.offset = i + 1;
					return Object.create(this, Object.assign({
						value: {
							value: str
						}
					}, properties));
				} else if (c === '\\') {
					i += 1;
					c = pp.chunk[i];
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
							c = parseInt(pp.chunk.substr(i + 1, 4), 16);
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
			if (i === pp.chunk.length && c !== tc) {
				tokenizer.error('Unterminated string', properties, {
					value: str
				});
			}
		}
	},

	type: {
		value: 'string'
	}
});

export const NumberToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, pp, properties) {
			let str = pp.chunk[pp.offset];
			pp.offset += 1;
			for (; pp.offset < pp.chunk.length;) {
				const c = pp.chunk[pp.offset];
				if ((c < '0' || c > '9') && c !== '.' && c !== 'e' && c !== 'E') {
					break;
				}
				pp.offset += 1;
				str += c;
			}
			return Object.create(this, Object.assign(properties, {
				value: {
					value: +str
				}
			}));
		}
	},
	type: {
		value: 'number'
	}
});


export const OperatorToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, pp, properties) {
			pp.offset += this.value.length;
			return Object.create(this, properties);
		}
	},

	type: {
		value: 'operator'
	}
});

export const WhiteSpaceToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, pp, properties) {

			if (pp.chunk[pp.offset] === '\n') {
				pp.lineNumber += 1;
				pp.firstCharInLine = pp.offset;
			}
			pp.offset += 1;
			return undefined;
		}
	},
	type: {
		value: 'number'
	}
});


/**
 * Token representing 'end of file'
 */
export const EOFToken = Object.create(RootToken, {
	type: {
		value: 'EOF'
	}
});
