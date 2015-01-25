"use strict";

let path = require('path'),
	fs = require('fs'),
	defineGrammar = require('../lib/grammar');


test("Kitchen sink of tokens", function() {

	var tokens = [{
		type: "number",
		value: 4711,
		lineNumber: 1
	}, {
		type: "string",
		value: "str2",
		lineNumber: 2
	}, {
		type: "string",
		value: "str3",
		lineNumber: 2
	}, {
		type: "string",
		value: "\b\f\n\r\t\"\'A",
		lineNumber: 2
	}, {
		type: "identifier",
		value: "name1",
		lineNumber: 3
	}, {
		type: "identifier",
		value: "name_2",
		lineNumber: 3
	}, {
		type: "identifier",
		value: "n",
		lineNumber: 4
	}, {
		type: "operator",
		value: "+",
		lineNumber: 5
	}, {
		type: "operator",
		value: "-",
		lineNumber: 6
	}, {
		type: "operator",
		value: "*",
		lineNumber: 7
	}, {
		type: "operator",
		value: "/",
		lineNumber: 8
	}, {
		type: "operator",
		value: "(",
		lineNumber: 9
	}, {
		type: "operator",
		value: ")",
		lineNumber: 9
	}, {
		type: "operator",
		value: "{",
		lineNumber: 10
	}, {
		type: "operator",
		value: "}",
		lineNumber: 10
	}, {
		type: "operator",
		value: "[",
		lineNumber: 11
	}, {
		type: "operator",
		value: "]",
		lineNumber: 11
	}, {
		type: "operator",
		value: ":",
		lineNumber: 12
	}, {
		type: "operator",
		value: ",",
		lineNumber: 12
	}, {
		type: "operator",
		value: ";",
		lineNumber: 12
	}, {
		type: "operator",
		value: ".",
		lineNumber: 12
	}, {
		type: "operator",
		value: "<",
		lineNumber: 13
	}, {
		type: "operator",
		value: "===",
		lineNumber: 13
	}, {
		type: "operator",
		value: ">",
		lineNumber: 13
	}, {
		type: "operator",
		value: "<=",
		lineNumber: 14
	}, {
		type: "operator",
		value: ">=",
		lineNumber: 15
	}, {
		type: "operator",
		value: "=",
		lineNumber: 16
	}];

	expect(tokens.length * 3);

	let s = fs.readFileSync(path.join(__dirname, 'samples', 'tokens1.txt'), {
		encoding: 'utf8'
	});


	let myGrammar = defineGrammar({
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

	let i = 0;

	for (let token of myGrammar.tokenizer(s)) {
		/*	console.log(token.type + " " + token.value + " <> " + tokens[i].type + " " +
			tokens[i].value + " " + tokens[i].lineNumber);
*/
		equal(token.type, tokens[i].type, "type: " + tokens[i].type);
		equal(token.value, tokens[i].value, "value: " + tokens[i].value);
		equal(token.lineNumber, tokens[i].lineNumber, "lineNumber: " + tokens[i]
			.lineNumber);
		i++;
	}
});

/*
		exports.testTokenizerSampleHelloWorld = function(test) {
			var ts = new TokenStream();
			fs.createReadStream(path.join(__dirname, 'samples', 'hello_world.executor'))
				.pipe(ts);

			var tokens = [{
				type: "operator",
				value: "{",
				lineNumber: 1
			}, {
				type: "name",
				value: "run",
				lineNumber: 2
			}, {
				type: "string",
				value: "/bin/echo",
				lineNumber: 2
			}, {
				type: "string",
				value: "hello world",
				lineNumber: 2
			}, {
				type: "name",
				value: "run",
				lineNumber: 3
			}, {
				type: "string",
				value: "/bin/echo",
				lineNumber: 3
			}, {
				type: "string",
				value: "another hello world",
				lineNumber: 3
			}, {
				type: "operator",
				value: "}",
				lineNumber: 4
			}, ];

			test.expect(tokens.length * 3);

			ts.on('readable', function() {
				var token;
				while (token = ts.read()) {
					test.equals(token.type, tokens[0].type, "type");
					test.equals(token.value, tokens[0].value, "value");
					test.equals(token.lineNumber, tokens[0].lineNumber, "lineNumber");
					tokens.shift();
					if (tokens.length === 0) {
						test.done();
						return;
					}
				}
			});
		};

		exports.testTokenizer20k = function(test) {
			var ts = new TokenStream();
			fs.createReadStream(path.join(__dirname, 'samples', 'tokens2.txt')).pipe(ts);

			var maxtokens = 1000;

			test.expect(maxtokens * 3);

			var i = 0;
			var n = 0;

			ts.on('readable', function() {
				var token;

				if (i >= maxtokens) {
					test.done();
					return;
				}

				while (token = ts.read()) {
					//console.log("got token: " + i + " " + token);

					if (i % 2 == 0) {
						test.equals(token.type, "number");
						test.equals(token.value, n);
						test.equals(token.lineNumber, n + 1);
					} else {
						test.equals(token.type, "string");
						test.equals(token.value, n);
						test.equals(token.lineNumber, n + 1);
						n++;
					}

					i++;

					if (i >= maxtokens) {
						test.done();
						return;
					}
				}
			});
		};
*/
