"use strict";

function defineGrammar(options) {
  let grammar = Object.create({});

  let maxOperatorLengthForFirstChar = {};

  for (let c in options.operators) {
    let op = options.operators[c];
    const firstChar = c[0];
    const maxLength = maxOperatorLengthForFirstChar[firstChar] || 0;

    if (maxLength < c.length) {
      maxOperatorLengthForFirstChar[firstChar] = c.length;
    }
  }

  grammar.maxOperatorLengthForFirstChar = maxOperatorLengthForFirstChar;
  grammar.operators = options.operators;

  return grammar;
}

let grammar = defineGrammar({
  operators: {
    '=': {},
    '+': {},
    '-': {},
    '*': {},
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
    '===': {}
  }
});

/*
let _token = {
  led: function() {},
  nud: function() {}
};
*/

function* lexer(chunk) {

  const makeToken = function(type, value) {
    return {
      type: type,
      value: value,
      lineNumber: lineNumber,
      toString: function() {
        return lineNumber + ", " + type + ": " + value;
      }
    };
  };

  let c, str;
  let lineNumber = 1;
  let firstCharInLine = 0;
  let i = 0;
  let op, operatorLength;

  while (c = chunk[i]) {
    if (c <= ' ') {
      if (c === '\n') {
        lineNumber += 1;
        firstCharInLine = i;
      }
      i += 1;
      c = chunk[i];
    } else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
      str = c;
      i += 1;
      for (;;) {
        c = chunk[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
          (c >= '0' && c <= '9') || c === '_') {
          str += c;
          i += 1;
        } else {
          break;
        }
      }

      yield makeToken('identifier', str);
    } else if (c >= '0' && c <= '9') {
      str = c;
      i += 1;
      for (;;) {
        c = chunk[i];
        if (c < '0' || c > '9') {
          break;
        }
        i += 1;
        str += c;
      }

      yield makeToken('number', +str);
    } else if (c === '"') {
      i += 1;
      str = '';
      for (;;) {
        c = chunk[i];
        if (c === '"') {
          break;
        } else if (c === '\\') {
          i += 1;
          /*   if (i >= length) {
					       makeToken('string', str).error("Unterminated string");
					   }*/
          c = chunk[i];
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
              // TODO
              /*
							if (i >= length) {
								makeToken('string', str).error("Unterminated string");
							}*/

              c = parseInt(chunk.substr(i + 1, 4), 16);
              if (!isFinite(c) || c < 0) {
                makeToken('string', str).error("Unterminated string");
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
      i += 1;
      yield makeToken('string', str);

    } else if (operatorLength = grammar.maxOperatorLengthForFirstChar[c]) {
      c = chunk.substring(i, i + operatorLength);
      if (grammar.operators[c]) {
        yield makeToken('operator', c);
        i += operatorLength;
      } else {
        operatorLength -= 1;
        c = chunk.substring(i, i + operatorLength);
        if (grammar.operators[c]) {
          yield makeToken('operator', c);
          i += operatorLength;
        } else {
          operatorLength -= 1;
          c = chunk.substring(i, i + operatorLength);
          if (grammar.operators[c]) {
            yield makeToken('operator', c);
            i += operatorLength;
          } else {
            console.log("error: " + operatorLength + " " + c);
          }
        }
      }
    } else {
      i += 1;
      yield makeToken('unknown', c);
    }
  }
};

module.exports = lexer;
