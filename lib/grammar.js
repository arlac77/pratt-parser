"use strict";

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
                      yield makeToken('string', str);
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

/*
    let token = tokenizer.next();

    let expression = function(rbp) {
      console.log("*** expression");

      let t = token;
      let left = t.nud();
      while (rbp < token.lbp) {
        t = token;
        token = tokenizer.next();
        left = t.led(left);
      }
      return left;
    };
*/
    let grammar = Object.create({
      tokenizer: tokenizer/*,
      expression: expression*/
    });

  return grammar;
}



module.exports = defineGrammar;
