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
      chunk: ' CREATE TABLE',
      offset: 1,
      lineNumber: 1,
      get properties() {
        return {};
      }
    };

    const t = keywords.parseString(pp);

    it.only('delivers keyword', () => assert.equal('CREATE', t.value));
  });
});
