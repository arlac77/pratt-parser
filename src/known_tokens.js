/* jslint node: true, esnext: true */

'use strict';

/**
 * @module pratt-parser
 */

export const RootToken = {
	precedence: 0,
	type: 'unknown',
	value: undefined,

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
	type: {
		value: 'identifier'
	}
});

export const StringToken = Object.create(RootToken, {
	type: {
		value: 'string'
	}
});

export const NumberToken = Object.create(RootToken, {
	type: {
		value: 'number'
	}
});

export const OperatorToken = Object.create(RootToken, {
	type: {
		value: 'operator'
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
