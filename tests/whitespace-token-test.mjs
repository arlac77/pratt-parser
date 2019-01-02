import test from 'ava';

import { WhiteSpaceToken } from '../src/known-tokens';

test('whitespace', t => {
  const tokenizer = {};
  const pp = {
    chunk: 'x   \n  A',
    offset: 1,
    lineNumber: 1
  };

  const token = WhiteSpaceToken.parseString(pp);

  //t.is(token.value, undefined);
  t.is(pp.offset, 7);
  t.is(pp.lineNumber, 2);
});
