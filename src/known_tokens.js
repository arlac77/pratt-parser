/* jslint node: true, esnext: true */

'use strict';

/**
 * @module pratt-parser
 */

export const RootToken = {
  //get precedence() { return 0; },
  precedence: 0,
  get type() {
    return 'unknown';
  },
  get value() {
    return undefined;
  },

  registerWithinTokenizer(tokenizer) {},

  /**
   * Parses from chunk of PrasePosition and delivers next token
   * Modifies ParsePosition so that it points behind the detected token.
   * @param {PrsePosition} pp
   * @return {Token}
   */
  parseString(pp) {
    return undefined;
  },
  toString() {
    return `${this.type}: ${this.value} [${this.precedence}]`;
  },
  led(grammar, left) {
    return left;
  },
  nud(grammar) {
    return this;
  },
  combine() {
    return 0;
  }
};

export const IdentifierToken = Object.create(RootToken, {
  firstChar: {
    value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_'
  },
  registerWithinTokenizer: {
    value(tokenizer) {
      for (const c of this.firstChar) {
        tokenizer.maxTokenLengthForFirstChar[c] = 1;
        tokenizer.registeredTokens[c] = this;
      }
    }
  },
  parseString: {
    value(pp) {
      let i = pp.offset + 1;
      for (;;) {
        const c = pp.chunk[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
          (c >= '0' && c <= '9') || c === '_') {
          i += 1;
        } else {
          break;
        }
      }

      const properties = pp.properties;
      properties.value = {
        value: pp.chunk.substring(pp.offset, i)
      };
      pp.offset = i;
      return Object.create(this, properties);
    }
  },
  type: {
    value: 'identifier'
  }
});

export const KeywordToken = Object.create(IdentifierToken, {
  keywords: {
    value: {}
  },
  registerWithinTokenizer: {
    value(tokenizer) {
      Object.keys(this.keywords).forEach(k => {
        const c = k[0];
        console.log(`${k} ${c}`);
        tokenizer.maxTokenLengthForFirstChar[k] = 1;
        tokenizer.registeredTokens[k] = this;
      });
    }
  },
  parseString: {
    value(pp) {
      const properties = pp.properties;
      const tc = pp.chunk[pp.offset];
      let str = '';
      let i = pp.offset + 1;
      let c;
      for (; i < pp.chunk.length;) {
        c = pp.chunk[i];
        if (c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z') {
          pp.offset = i + 1;
          return Object.create(this, Object.assign({
            value: {
              value: str
            }
          }, properties));
        }
      }
    }
  },
  type: {
    value: 'keyword'
  }
});

export const StringToken = Object.create(RootToken, {
  registerWithinTokenizer: {
    value(tokenizer) {
      for (const c of '"\'') {
        tokenizer.maxTokenLengthForFirstChar[c] = 1;
        tokenizer.registeredTokens[c] = this;
      }
    }
  },
  parseString: {
    value(pp) {
      const properties = pp.properties;
      const tc = pp.chunk[pp.offset];
      let str = '';
      let i = pp.offset + 1;
      let c;
      for (; i < pp.chunk.length;) {
        c = pp.chunk[i];
        if (c === tc) {
          pp.offset = i + 1;
          return Object.create(this, Object.assign({
            value: {
              value: str
            }
          }, properties));
        } else if (c === '\\') {
          i += 1;
          c = pp.chunk[i];
          switch (c) {
            case 'b':
              c = '\b';
              break;
            case 'f':
              c = '\f';
              break;
            case 'n':
              c = '\n';
              break;
            case 'r':
              c = '\r';
              break;
            case 't':
              c = '\t';
              break;
            case 'u':
              c = parseInt(pp.chunk.substr(i + 1, 4), 16);
              if (!isFinite(c) || c < 0) {
                pp.tokenizer.error('Unterminated string', pp, str);
              }
              c = String.fromCharCode(c);
              i += 4;
              break;
          }
          str += c;
          i += 1;
        } else {
          str += c;
          i += 1;
        }
      }
      if (i === pp.chunk.length && c !== tc) {
        pp.tokenizer.error('Unterminated string', pp, str);
      }
    }
  },
  type: {
    value: 'string'
  }
});

export const NumberToken = Object.create(RootToken, {
  registerWithinTokenizer: {
    value(tokenizer) {
      for (const c of '0123456789') {
        tokenizer.maxTokenLengthForFirstChar[c] = 1;
        tokenizer.registeredTokens[c] = this;
      }
    }
  },
  parseString: {
    value(pp) {
      const properties = pp.properties;
      let str = pp.chunk[pp.offset];
      pp.offset += 1;
      for (; pp.offset < pp.chunk.length;) {
        const c = pp.chunk[pp.offset];
        if ((c < '0' || c > '9') && c !== '.' && c !== 'e' && c !== 'E') {
          break;
        }
        pp.offset += 1;
        str += c;
      }
      return Object.create(this, Object.assign(properties, {
        value: {
          value: +str
        }
      }));
    }
  },
  type: {
    value: 'number'
  }
});


export const OperatorToken = Object.create(RootToken, {
  registerWithinTokenizer: {
    value(tokenizer) {
      const c = this.value;
      const firstChar = c[0];
      const maxLength = tokenizer.maxTokenLengthForFirstChar[firstChar] || 0;

      if (maxLength < c.length) {
        tokenizer.maxTokenLengthForFirstChar[firstChar] = c.length;
      }

      const p = tokenizer.registeredTokens[c];
      if (p) {
        // TODO dirty hack how to merge nud() and let() tokens
        //console.log(`Token already defined ${c} ${this.nud} <> ${p.nud}`);
        this.nud = p.nud;
        //tokenizer.registeredTokens[c] = Object.assign(this,p);
        tokenizer.registeredTokens[c] = this;
      } else {
        tokenizer.registeredTokens[c] = this;
      }
    }
  },
  parseString: {
    value(pp) {
      pp.offset += this.value.length;
      return Object.create(this, pp.properties);
    }
  },
  type: {
    value: 'operator'
  }
});

/**
 * skip white space
 */
export const WhiteSpaceToken = Object.create(RootToken, {
  registerWithinTokenizer: {
    value(tokenizer) {
      for (const c of ' \f\t\b\r\n') {
        tokenizer.maxTokenLengthForFirstChar[c] = 1;
        tokenizer.registeredTokens[c] = this;
      }
    }
  },
  parseString: {
    value(pp) {
      while (pp.chunk[pp.offset] <= ' ') {
        if (pp.chunk[pp.offset] === '\n') {
          pp.lineNumber += 1;
          pp.firstCharInLine = pp.offset;
        }
        pp.offset += 1;
      }
      return undefined;
    }
  },
  type: {
    value: 'space'
  }
});

/**
 * skips until end of line
 */
export const LineCommentToken = Object.create(RootToken, {
  parseString: {
    value(pp) {
      while (pp.chunk[pp.offset] !== '\n' &&  pp.chunk[pp.offset] !== undefined) {
        pp.offset += 1;
      }

      pp.lineNumber += 1;
      pp.firstCharInLine = pp.offset;
      return undefined;
    }
  },
  type: {
    value: 'comment'
  }
});

/**
 * Token representing 'end of file'
 */
export const EOFToken = Object.create(RootToken, {
  type: {
    value: 'EOF'
  }
});
