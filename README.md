[![npm](https://img.shields.io/npm/v/pratt-parser.svg)](https://www.npmjs.com/package/pratt-parser)
[![Greenkeeper](https://badges.greenkeeper.io/arlac77/pratt-parser.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/pratt-parser)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://secure.travis-ci.org/arlac77/pratt-parser.png)](http://travis-ci.org/arlac77/pratt-parser)
[![codecov.io](http://codecov.io/github/arlac77/pratt-parser/coverage.svg?branch=master)](http://codecov.io/github/arlac77/pratt-parser?branch=master)
[![Coverage Status](https://coveralls.io/repos/arlac77/pratt-parser/badge.svg)](https://coveralls.io/r/arlac77/pratt-parser)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/pratt-parser/badge.svg)](https://snyk.io/test/github/arlac77/pratt-parser)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/pratt-parser.svg?style=flat-square)](https://github.com/arlac77/pratt-parser/issues)
[![Stories in Ready](https://badge.waffle.io/arlac77/pratt-parser.svg?label=ready&title=Ready)](http://waffle.io/arlac77/pratt-parser)
[![Dependency Status](https://david-dm.org/arlac77/pratt-parser.svg)](https://david-dm.org/arlac77/pratt-parser)
[![devDependency Status](https://david-dm.org/arlac77/pratt-parser/dev-status.svg)](https://david-dm.org/arlac77/pratt-parser#info=devDependencies)
[![docs](http://inch-ci.org/github/arlac77/pratt-parser.svg?branch=master)](http://inch-ci.org/github/arlac77/pratt-parser)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![downloads](http://img.shields.io/npm/dm/pratt-parser.svg?style=flat-square)](https://npmjs.org/package/pratt-parser)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# pratt-parser

Pratt Parser

Based on
[Top Down Operator Precedence](https://tdop.github.io) and
[Douglas Crockford TDOP](https://github.com/douglascrockford/TDOP)

```javascript
const {Parser, WhiteSpaceToken, NumberToken} = require('pratt-parser');

function Value(value) {
  return Object.create(null, {
    value: {
      value: value
    }
  });
}

const myGrammar = new Parser({
  tokens: [
    WhiteSpaceToken,
    NumberToken
  ],
  prefix: {
    '(': {
      nud(grammar) {
        const e = grammar.expression(0);
        grammar.advance(')');
        return e;
      }
    }
  },
  infix: {
    ')': {},
    '+': {
      precedence: 50,
      combine: (left, right) => Value(left.value + right.value)
    },
    '-': {
      precedence: 50,
      combine: (left, right) => Value(left.value - right.value)
    },
    '*': {
      precedence: 60,
      combine: (left, right) => Value(left.value * right.value)
    },
    '/': {
      precedence: 60,
      combine: (left, right) => Value(left.value / right.value)
    }
  }
});

console.log(myGrammar.parse("(1 + (1 + 4 * 3)) * (2 + 1)").value);
```

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [Parser](#parser)
    -   [error](#error)
    -   [parse](#parse)
-   [pratt-parser](#pratt-parser)
-   [pratt-parser](#pratt-parser-1)
-   [pratt-parser](#pratt-parser-2)
-   [RootToken](#roottoken)
    -   [parseString](#parsestring)
-   [WhiteSpaceToken](#whitespacetoken)
-   [LineCommentToken](#linecommenttoken)
-   [EOFToken](#eoftoken)
-   [Tokenizer](#tokenizer)
    -   [tokens](#tokens)
    -   [error](#error-1)

## Parser

Creates a grammar for later parsing

**Parameters**

-   `grammar` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** definition of the grammar with operators...
-   `options`   (optional, default `{}`)

### error

Forwards error to the tokenizer

**Parameters**

-   `args` **...any** 

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** error

### parse

Parses the input and delivers the outermoost expression.

**Parameters**

-   `chunk` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** input text
-   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** object transparently passed to tokenizer

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** evaluated input

## pratt-parser

## pratt-parser

## pratt-parser

## RootToken

Base object for all tokens

### parseString

Parses from chunk of PrasePosition and delivers next token
Modifies ParsePosition so that it points behind the detected token.

**Parameters**

-   `pp` **PrsePosition** 

Returns **Token** 

## WhiteSpaceToken

skip white space

## LineCommentToken

skips until end of line

## EOFToken

Token representing 'end of file'

## Tokenizer

Creates a tokenizer for later parsing

**Parameters**

-   `grammar` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** definition of the grammar with operators...

### tokens

delivers tokens from the input

**Parameters**

-   `chunk` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the input to be processed
-   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** additional info to be used by the actual token types

### error

**Parameters**

-   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** token initiating the error
-   `value` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** error

# install

With [npm](http://npmjs.org) do:

```shell
npm install pratt-parser
```

# license

BSD-2-Clause
