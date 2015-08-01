/* jslint node: true, esnext: true */

"use strict";


function TDOP(tokens) {

	let token = tokens.next();

	function error(message) {
		throw new Error(message);
	}

	let expression = function (rbp) {
		console.log("*** expression");

		let left;
		let t = token;
		advance();
		left = t.nud();
		while (rbp < token.lbp) {
			t = token;
			advance();
			left = t.led(left);
		}
		return left;
	};

	let advance = function (id) {
		console.log("*** advance " + (id ? (id + " <> " + (token ? token.id :
				'')) :
			''));

		let a, o, t, v;
		if (id && token.id !== id) {
			error("Expected '" + id + "'.");
		}

		token = tokens.next();
		if (!token) {
			token = symbol_table["(end)"];
			return;
		}

		t = token;

		v = t.value;
		a = t.type;
		if (a === "name") {
			o = scope.find(v);
		} else if (a === "operator") {
			o = symbol_table[v];
			if (!o) {
				error("Unknown operator");
			}
		} else if (a === "string" || a === "number") {
			o = symbol_table["(literal)"];
			a = "literal";
		} else {
			error("Unexpected token: " + a);
		}
		console.log("o = " + o + " " + a);
		token = Object.create(o);
		token.from = t.from;
		token.to = t.to;
		token.value = v;
		token.arity = a;
		return token;
	};

	advance(undefined);

};

module.exports = TDOP;


/*
TDOPStream.prototype._flush = function(done) {
	var scope;
	var symbol_table = {};
	var token;
	var tokens = this.tokens;
	var token_nr = 0;

	var ts;

	var itself = function() {
		return this;
	};

	var original_scope = {
		define: function(n) {
			console.log("Define: " + n.value);
			var t = this.def[n.value];
			if (typeof t === "object") {
				n.error(t.reserved ? "Already reserved." : "Already defined.");
			}
			this.def[n.value] = n;
			n.reserved = false;
			n.nud = itself;
			n.led = null;
			n.std = null;
			n.lbp = 0;
			n.scope = scope;
			return n;
		},
		find: function(n) {
			console.log("*** find " + n);
			var e = this,
				o;
			while (true) {
				o = e.def[n];

				if (o && typeof o !== 'function') {
					console.log("*** find  got 1: " + e.def[n]);
					return e.def[n];
				}
				e = e.parent;
				if (!e) {
					o = symbol_table[n];
					console.log("*** find  got 2: " + o + " " + JSON.stringify(symbol_table));
					return o && typeof o !== 'function' ? o : symbol_table["(name)"];
				}
			}
		},
		pop: function() {
			scope = this.parent;
		},
		reserve: function(n) {
			if (n.arity !== "name" || n.reserved) {
				return;
			}
			var t = this.def[n.value];
			if (t) {
				if (t.reserved) {
					return;
				}
				if (t.arity === "name") {
					n.error("Already defined.");
				}
			}
			this.def[n.value] = n;
			n.reserved = true;
		}
	};

	var new_scope = function() {
		var s = scope;
		scope = Object.create(original_scope);
		scope.def = {};
		scope.parent = s;
		return scope;
	};

	var original_symbol = {
		nud: function() {
			this.error("Undefined.");
		},
		led: function(left) {
			this.error("Missing operator.");
		},
		error: function(message) {
			console.log("Error:" + message);
		}
	};

	var symbol = function(id, bp) {
		var s = symbol_table[id];
		bp = bp || 0;
		if (s) {
			if (bp >= s.lbp) {
				s.lbp = bp;
			}
		} else {
			s = Object.create(original_symbol);
			s.id = s.value = id;
			s.lbp = bp;
			symbol_table[id] = s;
		}
		return s;
	};

	var advance = function(id) {
		console.log("*** advance " + (id ? (id + " <> " + (token ? token.id : '')) :
			''));

		var a, o, t, v;
		if (id && token.id !== id) {
			token.error("Expected '" + id + "'.");
		}
		if (token_nr >= tokens.length) {
			token = symbol_table["(end)"];
			return;
		}
		t = tokens[token_nr];

		token_nr += 1;

		v = t.value;
		a = t.type;
		if (a === "name") {
			o = scope.find(v);
		} else if (a === "operator") {
			o = symbol_table[v];
			if (!o) {
				t.error("Unknown operator.");
			}
		} else if (a === "string" || a === "number") {
			o = symbol_table["(literal)"];
			a = "literal";
		} else {
			t.error("Unexpected token.");
		}
		console.log("o = " + o + " " + a);
		token = Object.create(o);
		token.from = t.from;
		token.to = t.to;
		token.value = v;
		token.arity = a;
		return token;
	};

	var expression = function(rbp) {
		console.log("*** expression");

		var left;
		var t = token;
		advance();
		left = t.nud();
		while (rbp < token.lbp) {
			t = token;
			advance();
			left = t.led(left);
		}
		return left;
	};

	var statement = function() {
		console.log("*** statement token = " + JSON.stringify(token));
		var n = token,
			v;

		if (n.std) {
			advance();
			scope.reserve(n);
			return n.std();
		}
		v = expression(0);
		if (!v.assignment && v.id !== "(") {
			v.error("Bad expression statement.");
		}
		advance(";");
		return v;
	};

	var statements = function() {
		console.log("*** statements");

		var a = [],
			s;
		while (true) {
			if (token.id === "}" || token.id === "(end)") {
				break;
			}
			s = statement();
			if (s) {
				a.push(s);
			}
		}
		return a.length === 0 ? null : a.length === 1 ? a[0] : a;
	};

	var stmt = function(s, f) {
		var x = symbol(s);
		x.std = f;
		return x;
	};

	var block = function() {
		console.log("*** block");
		var t = token;
		advance("{");
		return t.std();
	};

	stmt("var", function() {
		console.log("*** var");

		var a = [],
			n, t;
		while (true) {
			n = token;
			if (n.arity !== "name") {
				n.error("Expected a new variable name.");
			}
			console.log("var define: " + n);

			scope.define(n);
			advance();
			if (token.id === "=") {
				t = token;
				advance("=");
				t.first = n;
				t.second = expression(0);
				t.arity = "binary";
				a.push(t);
			}
			if (token.id !== ",") {
				break;
			}
			advance(",");
		}
		advance(";");
		return a.length === 0 ? null : a.length === 1 ? a[0] : a;
	});

	stmt("{", function() {
		console.log("*** stmt {");

		new_scope();
		var a = statements();
		advance("}");
		scope.pop();
		return a;
	});


	new_scope();
	advance();
	var s = statements();
	advance("(end)");
	scope.pop();

	this.push(s);
	done();
};
*/

/*
 */
