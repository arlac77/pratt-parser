[![npm](https://img.shields.io/npm/v/pratt-parser.svg)](https://www.npmjs.com/package/pratt-parser)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://spdx.org/licenses/0BSD.html)
[![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript\&label\&labelColor=blue\&color=555555)](https://typescriptlang.org)
[![bundlejs](https://deno.bundlejs.com/?q=pratt-parser\&badge=detailed)](https://bundlejs.com/?q=pratt-parser)
[![downloads](http://img.shields.io/npm/dm/pratt-parser.svg?style=flat-square)](https://npmjs.org/package/pratt-parser)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/pratt-parser.svg?style=flat-square)](https://github.com/arlac77/pratt-parser/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Fpratt-parser%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/pratt-parser/goto)
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

*   [ParsePosition](#parseposition)
    *   [Properties](#properties)
*   [Token](#token)
    *   [Properties](#properties-1)
*   [RootToken](#roottoken)
    *   [parseString](#parsestring)
        *   [Parameters](#parameters)
*   [WhiteSpaceToken](#whitespacetoken)
*   [LineCommentToken](#linecommenttoken)
*   [EOFToken](#eoftoken)
*   [Parser](#parser)
    *   [Parameters](#parameters-1)
    *   [error](#error)
        *   [Parameters](#parameters-2)
    *   [parse](#parse)
        *   [Parameters](#parameters-3)
*   [Tokenizer](#tokenizer)
    *   [Parameters](#parameters-4)
    *   [tokens](#tokens)
        *   [Parameters](#parameters-5)
    *   [error](#error-1)
        *   [Parameters](#parameters-6)

## ParsePosition

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Properties

*   `offset` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;
*   `chunk` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;

## Token

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Properties

*   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;
*   `precedence` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;
*   `value` **any**&#x20;

## RootToken

Base object for all tokens

### parseString

Parses from chunk of PrasePosition and delivers next token
Modifies ParsePosition so that it points behind the detected token.

#### Parameters

*   `pp` **[ParsePosition](#parseposition)**&#x20;

Returns **[Token](#token)**&#x20;

## WhiteSpaceToken

skip white space

## LineCommentToken

skips until end of line

## EOFToken

Token representing 'end of file'

## Parser

Creates a grammar for later parsing

### Parameters

*   `grammar` **any**&#x20;
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**&#x20;

### error

Forwards error to the tokenizer

#### Parameters

*   `args` **...any**&#x20;

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** error

### parse

Parses the input and delivers the outermoost expression.

#### Parameters

*   `chunk` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** input text
*   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** object transparently passed to tokenizer

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** evaluated input

## Tokenizer

Creates a tokenizer for later parsing.

### Parameters

*   `grammar` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** definition of the grammar with operators...

### tokens

delivers tokens from the input.

#### Parameters

*   `chunk` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the input to be processed
*   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** additional info to be used by the actual token types

### error

#### Parameters

*   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&#x20;
*   `context` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** token initiating the error
*   `value` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**&#x20;

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** error

# install

With [npm](http://npmjs.org) do:

```shell
npm install pratt-parser
```

# license

BSD-2-Clause
