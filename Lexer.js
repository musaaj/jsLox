import pkg from 'voca';
const { isDigit, isAlphaDigit, isAlpha, isBlank } = pkg;

import { TokenTypes } from './TokenTypes.js';
import { Token } from './Token.js';
import { Lox } from './Lox.js';

class Lexer {
  line = 1;
  column = 0;
  current = 0;
  input = '';
  tokens = [];

  constructor(input) {
    this.input = input;
  }

  tokenize() {
    if (this.tokens.length) return this.tokens;
    while (!this.eof()) {
      this.skipSpace();
      const token = this.advance();

      switch (token) {
        case '-':
          this.addToken(TokenTypes.MINUS, token);
          break;
        case '+':
          this.addToken(TokenTypes.PLUS, token);
          break;
        case '*':
          this.addToken(TokenTypes.MUL, token);
          break;
        case '/':
          this.addToken(TokenTypes.DIV, token);
          break;
        case '^':
          this.addToken(TokenTypes.POW, token);
          break;
        case '%':
          this.addToken(TokenTypes.MOD, token);
          break;
        case '=':
          this.assign();
          break;
        case '>':
          this.greater();
          break;
        case '<':
          this.less();
          break;
        case '|':
          this.addToken(TokenTypes.BITWISE_OR, token);
          break;
        case '&':
          this.addToken(TokenTypes.BITWISE_AND, token);
          break;
        case '(':
          this.addToken(TokenTypes.LEFT_PAREN, token);
          break;
        case ')':
          this.addToken(TokenTypes.RIGHT_PAREN, token);
          break;
        case '{':
          this.addToken(TokenTypes.LEFT_BRACE, token);
          break;
        case '}':
          this.addToken(TokenTypes.RIGHT_BRACE);
          break;
        case ';':
          this.addToken(TokenTypes.SEMICOLON, token);
          break;
        case ',':
          this.addToken(TokenTypes.COMMA, token);
          break;
				case "#":
					this.skipComment();
					break;
        case '"':
          this.string();
          break;
        default:
          if (isDigit(token)) {
            this.number();
          } else if (isAlpha(token)) {
            this.identifier();
          } else
            Lox.error(`unexpected token '${token}'`, this.line, this.column);
          break;
      }
    }

    this.addToken(TokenTypes.RIGHT_BRACE, '}');

    return this.tokens;
  }

  addToken(type, value) {
    this.tokens.push(new Token(type, value, this.line, this.column));
  }

  assign() {
    if (this.peek() == '=') {
      this.advance();
      this.addToken(TokenTypes.EQUAL_EQUAL, '==');
      return;
    }
    this.addToken(TokenTypes.ASSIGN, '=');
  }

  greater() {
    if (this.peek() == '=') {
      this.advance();
      this.addToken(TokenTypes.GREATER_EQUAL, '>=');
      return;
    } else if (this.peek() == '>') {
      this.advance();
      this.addToken(TokenTypes.BITWISE_RSHIFT, '>>');
      return;
    }
    this.addToken(TokenTypes.GREATER, '>');
  }

  less() {
    if (this.peek() == '=') {
      this.advance();
      this.addToken(TokenTypes.LESS_EQUAL, '<=');
      return;
    }

    if (this.peek() === '<') {
      this.advance();
      this.addToken(TokenTypes.BITWISE_LSHIFT, '<<');
      return;
    }
    this.addToken(TokenTypes.LESS, '<');
  }

  number() {
    const start = this.current;
    const column = this.column;
    while (isDigit(this.peek())) this.advance();

    if (this.peek() === '.') this.advance();

    while (isDigit(this.peek())) this.advance();
    const token = this.input.substring(start - 1, this.current);
    this.tokens.push(new Token(TokenTypes.NUMBER, token, this.line, column));
  }

  identifier() {
    const start = this.current;
    const column = this.column;
    let type;

    while (this.isVar(this.peek())) this.advance();

    const token = this.input.substring(start - 1, this.current);

    switch (token) {
      case 'let':
        type = TokenTypes.LET;
        break;
      case 'nil':
        type = TokenTypes.NIL;
        break;
      case 'or':
        type = TokenTypes.OR;
        break;
      case 'and':
        type = TokenTypes.AND;
        break;
      case 'if':
        type = TokenTypes.IF;
        break;
      case 'else':
        type = TokenTypes.ELSE;
        break;
      case 'while':
        type = TokenTypes.WHILE;
        break;
      case 'for':
        type = TokenTypes.FOR;
        break;
      case 'fun':
        type = TokenTypes.FUN;
        break;
      case 'return':
        type = TokenTypes.RETURN;
        break;
      case 'break':
        type = TokenTypes.BREAK;
        break;
      case 'continue':
        type = TokenTypes.CONTINUE;
        break;
      default:
        type = TokenTypes.IDENTIFIER;
    }

    this.tokens.push(new Token(type, token, this.line, column));
  }

  string() {
    const start = this.current;
    const column = this.column;
    const line = this.line;

    while (!this.eof() && this.peek() != '"') this.advance();

    if (this.eof()) Lox.error('Unterminated string', line, column);

    this.advance();
    this.tokens.push(
      new Token(
        TokenTypes.STRING,
        this.input.substring(start, this.current - 1),
        line,
        column,
      ),
    );
  }

  skipSpace() {
    while (isBlank(this.peek())) this.advance();
  }

	skipComment(){
			while (this.peek() != "\n") this.advance();
	}

  advance() {
    const c = this.input[this.current];
    if (c == '\n') {
      this.line++;
      this.column = 0;
    } else this.column++;

    this.current++;
    return c;
  }

  peek() {
    return this.input[this.current];
  }

  eof() {
    return this.current >= this.input.length;
  }

  isVar(c) {
    return isAlphaDigit(c) || c == '_';
  }
}

export { Lexer };
