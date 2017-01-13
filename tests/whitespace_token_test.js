/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  WhiteSpaceToken
} = require('../dist/parser');

describe('tokens', () => {
  const tokenizer = {};

  describe('whitespace', () => {
    const pp = {
      chunk: '   ',
      offset: 0
    };

    it('delivers undefined', () => assert.equal(WhiteSpaceToken.parseString(tokenizer, pp, {}), undefined));
  });
});
