/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  IdentifierToken
} = require('../dist/parser');

describe('tokens', () => {
  const tokenizer = {};

  describe('identifier', () => {
    const pp = {
      chunk: ' abc   \n  A',
      offset: 1,
      lineNumber: 1,
      get properties() {
        return {};
      }
    };

    const t = IdentifierToken.parseString(pp);

    it('delivers identifier', () => assert.equal('abc', t.value));
    it('moved forward', () => assert.equal(4, pp.offset));
  });
});
