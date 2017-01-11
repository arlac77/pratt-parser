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
		value: function (tokenizer, chunk, offset, properties) {
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

			properties.value = {
				value: chunk.substring(offset, i)
			};
			return [Object.create(this, properties), i - offset];
		}
	},

	type: {
		value: 'identifier'
	}
});

export const KeywordToken = Object.create(RootToken, {
	type: {
		value: 'keyword'
	}
});

export const StringToken = Object.create(RootToken, {
	parseString: {
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
	},

	type: {
		value: 'string'
	}
});

export const NumberToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, chunk, offset, properties) {
			let str = chunk[offset];
			offset += 1;
			for (; offset < chunk.length;) {
				const c = chunk[offset];
				if ((c < '0' || c > '9') && c !== '.' && c !== 'e' && c !== 'E') {
					break;
				}
				offset += 1;
				str += c;
			}
			return [Object.create(this, Object.assign(properties, {
				value: {
					value: +str
				}
			})), str.length];
		}
	},
	type: {
		value: 'number'
	}
});


export const OperatorToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, chunk, offset, properties) {
			return [Object.create(this, properties), this.value.length];
		}
	},

	type: {
		value: 'operator'
	}
});

export const WhiteSpaceToken = Object.create(RootToken, {
	parseString: {
		value: function (tokenizer, chunk, offset, properties) {
			offset += 1;
			return [undefined, offset];
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
