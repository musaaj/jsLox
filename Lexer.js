import pkg from 'voca';
const { isDigit, isAlphaDigit, isAlpha, isBlank } = pkg;

import {TokenTypes} from "./TokenTypes.js";
import { Token } from "./Token.js";


class Lexer {
	line = 1;
	column = 0;
	current = 0;
	input = "";
	tokens = [];

	constructor(input)
	{
		this.input = input;
	}

	tokenize(){
		while (!this.eof())
		{
			this.skipSpace();
			const token = this.advance();
			
			switch(token)
			{
				case "-": this.addToken(TokenTypes.MINUS, token); break;
				case "+": this.addToken(TokenTypes.PLUS, token); break;
				case "*": this.addToken(TokenTypes.MUL, token); break;
				case "/": this.addToken(TokenTypes.DIV, token); break;
				case "^": this.addToken(TokenTypes.POW, token); break;
				case "=": this.addToken(TokenTypes.ASSIGN, token); break;
				case ";": this.addToken(TokenTypes.SEMICOLON, token); break;
					default:
					  if (isDigit(token))
							{
								this.number()
							}
					  else if(isAlpha(token))
						{
							this.identifier();
						}
						else console.log(`unexpected token '${token}'`);
					break;
			}

		}
		
		return this.tokens;
	}

	addToken(type, value)
	{
		this.tokens.push(new Token(
		type, value, this.line, this.column));
	}
	
	number()
	{
		const start = this.current;
		const column = this.column;
		while (isDigit(this.peek())) this.advance();

		if (this.peek() == ".") this.advance();

		while (isDigit(this.peek())) this.advance();
		const token = this.input.substring(start - 1, this.current);
		this.tokens.push(new Token(
			TokenTypes.NUMBER, token, this.line, column));
	}

	identifier()
	{
		const start = this.current;
		const column = this.column;

		while (this.isVar(this.peek())) this.advance();

		const token = this.input.substring(start - 1, this.current);

		this.tokens.push(new Token(TokenTypes.IDENTIFIER, token, this.line, column));
	}

	skipSpace()
	{
		while (isBlank(this.peek())) this.advance();
	}

	advance()
	{

		const c  = this.input[this.current];
		if (c == "\n")
		{
			this.line++;
			this.column = 0;
		} else this.column++;

		this.current++;
		return c;
	}

	peek()
	{
		return this.input[this.current];
	}

	eof()
	{
		return this.current >= this.input.length;
	}

	isVar(c)
	{
		return isAlphaDigit(c) || c == "_";
	}
}

export { Lexer };

//console.log(new Lexer("34 * 5 + 5.9 - 56.6 / 45 + my_name;").tokenize().map(token=>token.toString() + ""))
