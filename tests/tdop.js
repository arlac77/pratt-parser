"use strict";

let lexer = require('../lib/lexer'),
  tdop = require('../lib/tdop');

test("Kitchen sink of tokens", function() {
  expect(1);

  let expressions = tdop(lexer("var a = 2"));

  let e = expressions.next();

  equal(e.type, "identifier", "type");

});
