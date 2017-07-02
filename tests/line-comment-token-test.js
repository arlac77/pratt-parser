/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  LineCommentToken
} = require('../dist/parser');

describe('tokens', () => {
  const tokenizer = {};

  describe('line comment', () => {
    const pp = {
      chunk: 'x#   \n  A',
      offset: 1,
      lineNumber: 1
    };

    it('delivers undefined', () => assert.equal(undefined, LineCommentToken.parseString(pp)));
    it('moved forward', () => assert.equal(5, pp.offset));
    it('increased lineNumber', () => assert.equal(2, pp.lineNumber));
  });
});
