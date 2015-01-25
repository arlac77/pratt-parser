"use strict";

let path = require('path'),
	fs = require('fs'),
	defineGrammar = require('../lib/grammar');


test("Kitchen sink of tokens", function() {

	var tokens = [
		["number", 4711, 1],
		["string", "str2", 2],
		["string", "str3", 2],
		["string", "\b\f\n\r\t\"\'A", 2],
		["identifier", "name1", 3],
		["identifier", "name_2", 3],
		["identifier", "n", 4],
		["operator", "+", 5],
		["operator", "-", 6],
		["operator", "*", 7],
		["operator", "/", 8],
		["operator", "(", 9],
		["operator", ")", 9],
		["operator", "{", 10],
		["operator", "}", 10],
		["operator", "[", 11],
		["operator", "]", 11],
		["operator", ":", 12],
		["operator", ",", 12],
		["operator", ";", 12],
		["operator", ".", 12],
		["operator", "<", 13],
		["operator", "===", 13],
		["operator", ">", 13],
		["operator", "<=", 14],
		["operator", ">=", 15],
		["operator", "=", 16]
	];

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
		equal(token.type, tokens[i][0], "type: " + tokens[i][0]);
		equal(token.value, tokens[i][1], "value: " + tokens[i][1]);
		equal(token.lineNumber, tokens[i][2], "lineNumber: " + tokens[i][2]);
		i++;
	}


});

test("calculator",
	function() {
		let myGrammar = defineGrammar({
			terminals: {
				'number': {}
			},
			operators: {
				'+': {},
				'-': {},
				'*': {},
				'/': {},
				'(': {},
				')': {}
			}
		});

		myGrammar.parse("1 + 2");
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
