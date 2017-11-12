import test from 'ava';

import {
  WhiteSpaceToken,
  NumberToken,
  StringToken,
  IdentifierToken
} from '../src/known-tokens';
import { Tokenizer } from '../src/tokenizer';

const path = require('path');
const fs = require('fs');

const tokenizer = new Tokenizer({
  tokens: [WhiteSpaceToken, NumberToken, StringToken, IdentifierToken],
  infix: {
    '=': {
      precedence: 77
    },
    '+': {},
    '-': {},
    '*': {
      precedence: 42
    },
    '/': {},
    '(': {},
    ')': {},
    '[': {},
    ']': {},
    '{': {},
    '}': {},
    ':': {},
    '<': {},
    '>': {},
    '.': {},
    ',': {},
    ';': {},
    '<=': {},
    '>=': {},
    '=>': {},
    '===': {},
    '!===': {}
  }
});

test('Kitchen sink', t => {
  const tokens = [
    {
      type: 'number',
      value: 4711,
      line: 1,
      pos: 0
    },
    {
      type: 'number',
      value: 0.23,
      line: 1,
      pos: 5
    },
    {
      type: 'number',
      value: 12345.0,
      line: 1,
      pos: 10
    },
    {
      type: 'number',
      value: 12.4e20,
      line: 1,
      pos: 18
    },
    {
      type: 'number',
      value: 0.4e7,
      line: 1,
      pos: 26
    },
    {
      type: 'string',
      value: 'str2',
      line: 2,
      pos: 1
    },
    {
      type: 'string',
      value: 'str3',
      line: 2,
      pos: 7
    },
    {
      type: 'string',
      value: '\\\b\f\n\r\t"\'A',
      line: 2
    },
    {
      type: 'string',
      value: 'str4',
      line: 2
    },
    {
      type: 'string',
      value: 'str5',
      line: 2
    },
    {
      type: 'identifier',
      value: 'name1',
      line: 3
    },
    {
      type: 'identifier',
      value: 'name_2',
      line: 3
    },
    {
      type: 'identifier',
      value: '_name3',
      line: 3
    },
    {
      type: 'identifier',
      value: 'n',
      line: 4
    },
    {
      type: 'operator',
      value: '+',
      line: 5
    },
    {
      type: 'operator',
      value: '-',
      line: 6
    },
    {
      type: 'operator',
      value: '*',
      line: 7,
      precedence: 42
    },
    {
      type: 'operator',
      value: '/',
      line: 8
    },
    {
      type: 'operator',
      value: '(',
      line: 9
    },
    {
      type: 'operator',
      value: ')',
      line: 9
    },
    {
      type: 'operator',
      value: '{',
      line: 10
    },
    {
      type: 'operator',
      value: '}',
      line: 10
    },
    {
      type: 'operator',
      value: '[',
      line: 11
    },
    {
      type: 'operator',
      value: ']',
      line: 11
    },
    {
      type: 'operator',
      value: ':',
      line: 12
    },
    {
      type: 'operator',
      value: ',',
      line: 12
    },
    {
      type: 'operator',
      value: ';',
      line: 12
    },
    {
      type: 'operator',
      value: '.',
      line: 12
    },
    {
      type: 'operator',
      value: '<',
      line: 13
    },
    {
      type: 'operator',
      value: '===',
      line: 13
    },
    {
      type: 'operator',
      value: '!===',
      line: 13
      //      pos: 22
    },
    {
      type: 'operator',
      value: '>',
      line: 13
    },
    {
      type: 'operator',
      value: '<=',
      line: 14
    },
    {
      type: 'operator',
      value: '>=',
      line: 15
    },
    {
      type: 'operator',
      value: '=',
      line: 16,
      precedence: 77
    },
    {
      type: 'number',
      value: 2,
      line: 17
    },
    {
      type: 'operator',
      value: '+',
      line: 17
    },
    {
      type: 'operator',
      value: '(',
      line: 17
    },
    {
      type: 'number',
      value: 3,
      line: 17
    },
    {
      type: 'operator',
      value: '*',
      line: 17
    },
    {
      type: 'number',
      value: 17,
      line: 17
    },
    {
      type: 'operator',
      value: ')',
      line: 17
    }
  ];

  const s = fs.readFileSync(
    path.join(__dirname, '..', 'tests', 'fixtures', 'tokens1.txt'),
    {
      encoding: 'utf8'
    }
  );

  let i = 0;

  for (const token of tokenizer.tokens(s)) {
    const refToken = tokens[i];

    t.is(token.type, refToken.type);
    t.is(token.id, refToken.id);
    t.is(token.lineNumber, refToken.line);

    if (refToken.pos !== undefined) {
      t.is(token.positionInLine, refToken.pos);
    }
    if (refToken.precedence !== undefined) {
      t.is(token.precedence, refToken.precedence);
    }
    i++;
  }
});
