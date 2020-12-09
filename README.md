[![npm](https://img.shields.io/npm/v/pratt-parser.svg)](https://www.npmjs.com/package/pratt-parser)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/pratt-parser)](https://bundlephobia.com/result?p=pratt-parser)
[![downloads](http://img.shields.io/npm/dm/pratt-parser.svg?style=flat-square)](https://npmjs.org/package/pratt-parser)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/pratt-parser.svg?style=flat-square)](https://github.com/arlac77/pratt-parser/issues)
[![Build Action Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Fpratt-parser%2Fbadge&style=flat)](https://actions-badge.atrox.dev/arlac77/pratt-parser/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/pratt-parser/badge.svg)](https://snyk.io/test/github/arlac77/pratt-parser)
[![Coverage Status](https://coveralls.io/repos/arlac77/pratt-parser/badge.svg)](https://coveralls.io/github/arlac77/pratt-parser)

# pratt-parser

Pratt Parser

Based on
[Top Down Operator Precedence](https://tdop.github.io) and
[Douglas Crockford TDOP](https://github.com/douglascrockford/TDOP)

<!-- skip-example -->

```javascript
import { Parser, WhiteSpaceToken, NumberToken } from "pratt-parser";

function Value(value) {
  return Object.create(null, {
    value: {
      value: value
    }
  });
}

const myGrammar = new Parser({
  tokens: [WhiteSpaceToken, NumberToken],
  prefix: {
    "(": {
      nud(grammar) {
        const e = grammar.expression(0);
        grammar.advance(")");
        return e;
      }
    }
  },
  infix: {
    ")": {},
    "+": {
      precedence: 50,
      combine: (left, right) => Value(left.value + right.value)
    },
    "-": {
      precedence: 50,
      combine: (left, right) => Value(left.value - right.value)
    },
    "*": {
      precedence: 60,
      combine: (left, right) => Value(left.value * right.value)
    },
    "/": {
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

-   [pratt-parser](#pratt-parser)
-   [pratt-parser](#pratt-parser-1)
-   [pratt-parser](#pratt-parser-2)
-   [Parser](#parser)
    -   [Parameters](#parameters)
    -   [error](#error)
        -   [Parameters](#parameters-1)
    -   [parse](#parse)
        -   [Parameters](#parameters-2)
-   [RootToken](#roottoken)
    -   [parseString](#parsestring)
        -   [Parameters](#parameters-3)
-   [WhiteSpaceToken](#whitespacetoken)
-   [LineCommentToken](#linecommenttoken)
-   [EOFToken](#eoftoken)
-   [Tokenizer](#tokenizer)
    -   [Parameters](#parameters-4)
    -   [tokens](#tokens)
        -   [Parameters](#parameters-5)
    -   [error](#error-1)
        -   [Parameters](#parameters-6)

## pratt-parser

## pratt-parser

## pratt-parser

## Parser

Creates a grammar for later parsing

### Parameters

-   `grammar` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** definition of the grammar with operators...
-   `options`   (optional, default `{}`)

### error

Forwards error to the tokenizer

#### Parameters

-   `args` **...any** 

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** error

### parse

Parses the input and delivers the outermoost expression.

#### Parameters

-   `chunk` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** input text
-   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** object transparently passed to tokenizer

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** evaluated input

## RootToken

Base object for all tokens

### parseString

Parses from chunk of PrasePosition and delivers next token
Modifies ParsePosition so that it points behind the detected token.

#### Parameters

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

### Parameters

-   `grammar` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** definition of the grammar with operators...

### tokens

delivers tokens from the input

#### Parameters

-   `chunk` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the input to be processed
-   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** additional info to be used by the actual token types

### error

#### Parameters

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
