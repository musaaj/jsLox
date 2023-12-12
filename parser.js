import { TokenTypes } from "./TokenTypes.js";
import { Lexer } from "./Lexer.js";

class Parser {
	tokens = [];
	current = 0;
	constructor(tokens)
	{
		this.tokens = tokens;
	}

	statement()
	{
		return this.expr();
	}

	expr()
	{
		let expr = this.factor();
		return expr;
	}

	factor()
	{
		let expr = this.term();
		while(!this.eof() && this.match(TokenTypes.PLUS, TokenTypes.MINUS)){
			let ops = this.advance();
			const right = this.term()
			expr = new Binary(expr, ops, right, ops.line, ops.column);
		}

		return expr;
	}

	term()
	{
		let exp = this.terminal();
		while(!this.eof() && this.match(TokenTypes.MUL, TokenTypes.DIV))
		{
			let ops = this.advance();
			const right = this.terminal();
			exp = new Binary(exp, ops, right, ops.line, ops.column);
		}
		return exp;
	}

	terminal()
	{
		let terminal = this.advance()
		if (!terminal) return null;
		return new Terminal(
			terminal.type, terminal.value,
			terminal.line, terminal.column
		);
	}

	advance()
	{
		if (this.eof()) return null;
		return this.tokens[this.current++];
	}

	match(tokenTypes)
	{
		if (this.eof()) return false;
		for (let i = 0; i < arguments.length; i++)
		{
			if (this.check(arguments[i])) return true;
		}
		return false;
	}

	check(tokenType)
	{
		if (this.eof()) return false;
		return this.peek().type == tokenType;
	}

	peek()
	{
		return this.tokens[this.current];
	}

	eof()
	{
		return this.current >= this.tokens.length;
	}
}

class Binary {
	constructor(left, ops, right, line, column)
	{
		this.left = left;
		this.ops = ops;
		this.right = right;
		this.line = line;
		this.column = column;
	}
}

class Terminal {
	constructor(type, value, line, column)
	{
		this.type = type;
		this.value = value;
		this.line = line;
		this.column = column
	}
}

class Statement extends Binary{
}


let ps = new Parser(new Lexer("9 - 5 * 3 / 6 + 4").tokenize());
let expr = ps.statement()
console.log(expr);
