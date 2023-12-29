import { TokenTypes } from './TokenTypes.js';
import { Lox } from './Lox.js';
import { Binary, Statement, Terminal, Group, Var } from './Expr.js';

class Parser {
  tokens = [];
  current = 0;

  constructor(tokens) {
    this.tokens = tokens;
  }

  defVar() {
    if (this.match(TokenTypes.LET)) {
      const _let = this.advance();
      const identifier = this.consume(
        TokenTypes.IDENTIFIER,
        'identifier expected',
        _let.line,
        _let.column,
      );
      let right = null;

      if (this.match(TokenTypes.ASSIGN)) {
        this.advance();
        right = this.expression();
      }

      this.consume(TokenTypes.SEMICOLON, "';' expected", 2, 3);
      return new Var(identifier, right);
    }

    let expr = this.assign();
    this.consume(TokenTypes.SEMICOLON, "';' expected", 1, 1);
    return expr;
  }

  assign() {
    let expr = this.expression();

    while (this.match(TokenTypes.ASSIGN)) {
      let ops = this.advance();
      expr = new Statement(expr, ops, this.expression(), ops.line, ops.column);
    }

    return expr;
  }

  expression() {
    return this.factor();
  }

  factor() {
    let expr = this.term();
    while (this.match(TokenTypes.PLUS, TokenTypes.MINUS)) {
      let ops = this.advance();
      const right = this.term();
      expr = new Binary(expr, ops, right, ops.line, ops.column);
    }

    return expr;
  }

  term() {
    let expr = this.power();
    while (
      !this.eof() &&
      this.match(TokenTypes.MUL, TokenTypes.DIV, TokenTypes.MOD)
    ) {
      let ops = this.advance();
      const right = this.power();
      expr = new Binary(expr, ops, right, ops.line, ops.column);
    }
    return expr;
  }

  power() {
    let expr = this.terminal();

    while (this.match(TokenTypes.POW)) {
      let ops = this.advance();
      expr = new Binary(expr, ops, this.power(), ops.line, ops.column);
    }

    return expr;
  }

  terminal() {
    let terminal;

    if (
      this.match(
        TokenTypes.NUMBER,
        TokenTypes.STRING,
        TokenTypes.IDENTIFIER,
        TokenTypes.NIL,
      )
    ) {
      terminal = this.advance();
      return new Terminal(
        terminal.type,
        terminal.value,
        terminal.line,
        terminal.column,
      );
    }

    if (this.match(TokenTypes.LEFT_PAREN)) {
      const terminal = this.advance();
      const expr = this.factor();

      this.consume(
        TokenTypes.RIGHT_PAREN,
        "')' expected",
        terminal.line,
        terminal.column,
      );
      return new Group(expr);
    }

    terminal = this.advance();
    Lox.error(
      `invalid token ${terminal.value}`,
      terminal.line,
      terminal.column,
    );
  }

  consume(type, msg, line, column) {
    if (this.peek() && this.check(type)) return this.advance();

    Lox.error(msg, line, column);
    return null;
  }

  advance() {
    if (this.eof()) return null;
    return this.tokens[this.current++];
  }

  match() {
    if (this.eof()) return false;
    for (let i = 0; i < arguments.length; i++) {
      if (this.check(arguments[i])) return true;
    }
    return false;
  }

  check(tokenType) {
    if (this.eof()) return false;
    return this.peek().type == tokenType;
  }

  peek() {
    return this.tokens[this.current] || null;
  }

  eof() {
    return this.current >= this.tokens.length;
  }
}

export { Parser };
