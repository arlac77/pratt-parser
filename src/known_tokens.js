/* jslint node: true, esnext: true */

'use strict';

/**
 * @module pratt-parser
 */

export const rootToken = {
	precedence: 0,
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

/**
 * Token representing 'end of file'
 */
export const EOF = Object.create(rootToken, {
	type: {
		value: 'EOF'
	}
});
