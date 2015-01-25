"use strict";


const rootToken = {
  precedence : 0,
  nud : function() { console.log("nud:"); return 0; },
  led : function(token) { return 0; }
};

function defineGrammar(options) {
  let operators = options.operators;
  let maxOperatorLengthForFirstChar = {};

  for (let c in operators) {
    const firstChar = c[0];
    const maxLength = maxOperatorLengthForFirstChar[firstChar] || 0;

    if (maxLength < c.length) {
      maxOperatorLengthForFirstChar[firstChar] = c.length;
    }
  }

  const tokenizer = function *(chunk) {
      function error(message,values) {
        message += "," + lineNumber;
        if(values) message += ': ' + JSON.stringify(values);
        throw new Error(message);
      };

      function makeIdentifier(value) {
        return Object.create(rootToken,{
          type: { value: 'identifier' },
          value: { value: value },
          lineNumber: { value: lineNumber }
        });
      };

      function makeNumber(value) {
        return Object.create(rootToken,{
          type: { value: 'number' },
          value: { value: value },
          lineNumber: { value: lineNumber }
        });
      };

      function makeString(value) {
        return Object.create(rootToken,{
          type: { value: 'string' },
          value: { value: value },
          lineNumber: { value: lineNumber }
        });
      };

      function makeToken(type, value) {
        return Object.create(rootToken,{
          type: { value: type },
          value: { value: value },
          lineNumber: { value: lineNumber }
        });
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

          yield makeIdentifier(str);
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

          yield makeNumber(+str);
        } else if (c === '"') {
          i += 1;
          str = '';
          for (;;) {
            c = chunk[i];
            if (c === '"') {
              break;
            } else if (c === '\\') {
              i += 1;
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
                            c = parseInt(chunk.substr(i + 1, 4), 16);
                            if (!isFinite(c) || c < 0) {
                              error("Unterminated string",{ value: c });
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
                      yield makeString(str);
                    } else if (operatorLength = maxOperatorLengthForFirstChar[c]) {
                      c = chunk.substring(i, i + operatorLength);
                      if (operators[c]) {
                        yield makeToken('operator', c);
                        i += operatorLength;
                      } else {
                        operatorLength -= 1;
                        c = chunk.substring(i, i + operatorLength);
                        if (operators[c]) {
                          yield makeToken('operator', c);
                          i += operatorLength;
                        } else {
                          operatorLength -= 1;
                          c = chunk.substring(i, i + operatorLength);
                          if (operators[c]) {
                            yield makeToken('operator', c);
                            i += operatorLength;
                          } else {
                            error("Unknown operator",{ value: c });
                          }
                        }
                      }

        } else {
          i += 1;
          error("Unknown char",{ value: c });
        }
      }
    }; // tokenizer


    let grammar = Object.create({
      tokenizer: tokenizer,
      parse: function parse(chunk) {
        let tokens = tokenizer(chunk);
        let token = tokens.next();

        function consume() { return tokens.next(); }
        function expression(precedence) {
          let token = consume();
          console.log("*** expression");

          let left = token.nud();
          while (precedence < token.precedence) {
            token = consume();
            left = t.led(left);
          }
          return left;
        };

        return expression(0);
      }
    });

  return grammar;
}



module.exports = defineGrammar;
