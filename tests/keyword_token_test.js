/* global describe, it, xit */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

const {
  KeywordToken, Tokenizer
} = require('../dist/parser');

describe('tokens', () => {
  const keywords = Object.create(KeywordToken, {
    keywords: {
      value: {
        CREATE: {},
        TABLE: {}
      }
    }
  });

  const tokenizer = new Tokenizer({});

  keywords.registerWithinTokenizer(tokenizer);

  describe('keyword', () => {
    const pp = {
      chunk: ' CREATE TABLE X ',
      offset: 1,
      lineNumber: 1,
      get properties() {
        return {};
      }
    };

    const k1 = keywords.parseString(pp);
    it('delivers 1st. keyword', () => assert.equal('CREATE', k1.value));

    const k2 = keywords.parseString(pp);
    it('delivers 2nd. keyword', () => assert.equal('TABLE', k2.value));
  });
});
