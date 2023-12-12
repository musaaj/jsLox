import { TokenTypes } from "./TokenTypes.js";
import { Lexer } from "./Lexer.js";
import { Binary, Statement, Terminal } from "./Expr.js";

class Parser {
	tokens = [];
	current = 0;
	constructor(tokens)
	{
		this.tokens = tokens;
	}

	statement()
	{
		let expr = this.factor();

		while (!this.eof() && this.match(TokenTypes.ASSIGN))
		{
			let ops = this.advance();
			expr = new Statement(expr, ops, this.factor(), ops.line, ops.column);
		}

		return expr;
	}

	expression()
	{
		return this.factor();
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
		let expr = this.power();
		while(!this.eof() && this.match(TokenTypes.MUL, TokenTypes.DIV))
		{
			let ops = this.advance();
			const right = this.power();
			expr = new Binary(expr, ops, right, ops.line, ops.column);
		}
		return expr;
	}

	power()
	{
		let expr = this.terminal();

		while (!this.eof() && this.match(TokenTypes.POW))
		{
			let ops = this.advance();
			expr = new Binary(expr, ops, this.power(), ops.line, ops.column);
		}

		return expr;
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

	match()
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


let ps = new Parser(new Lexer("my_number = 5 - 4 * 3 ^ 8").tokenize());
let expr = ps.statement()
console.log(JSON.stringify(expr, null, 2));
