import { TokenTypes } from './TokenTypes.js';
import {
  Terminal,
  Binary,
  Group,
  Var,
  Program,
  If,
  While,
  For,
  FunCall,
  LoxFun,
  Return,
} from './Expr.js';
import { Lox } from './Lox.js';
import FunTypes from './FunTypes.js';
import { Token } from './Token.js';

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  program() {
    const stmts = [];
    while (!this.eofBlock()) {
      stmts.push(this.statement());
    }
    return new Program(stmts);
  }

  statement() {
    const token = this.peek();
    let stmt = null;
    switch (token.type) {
      case TokenTypes.LET:
        stmt = this.declare();
        this.expect(TokenTypes.SEMICOLON, '; expected');
        break;
      case TokenTypes.LEFT_BRACE:
        stmt = this.block();
        break;
      case TokenTypes.IF:
        stmt = this.consumeIf();
        break;
      case TokenTypes.WHILE:
        stmt = this.consumeWhile();
        break;
      case TokenTypes.FOR:
        stmt = this.consumeFor();
        break;
      case TokenTypes.FUN:
        stmt = this.fun();
        break;
      case TokenTypes.RETURN:
        stmt = this.consumeReturn();
        break;
      default:
        stmt = this.expression();
        this.expect(TokenTypes.SEMICOLON, '; expected');
        break;
    }
    return stmt;
  }

  consumeIf() {
    this.next();
    const condition = this.terminal();
    let thenBranch;
    let elseBranch = null;

    if (this.match(TokenTypes.LEFT_BRACE)) {
      thenBranch = this.block();
    } else {
      thenBranch = this.statement();
    }

    if (!this.eof() && this.match(TokenTypes.ELSE)) {
      this.next();
      if (this.match(TokenTypes.LEFT_BRACE)) elseBranch = this.block();
      else {
        elseBranch = this.statement();
      }
    }

    return new If(condition, thenBranch, elseBranch);
  }

  consumeWhile() {
    this.next();
    const condition = this.expression();
    const body = this.statement();

    return new While(condition, body);
  }

  consumeFor() {
    this.next();
    this.expect(TokenTypes.LEFT_PAREN, '( expected');
    const declaration = this.statement();
    const condition = this.expression();
    this.expect(TokenTypes.SEMICOLON, '; expected');
    const expr = this.expression();
    this.expect(TokenTypes.RIGHT_PAREN, ') expected');
    const body = this.statement();

    return new For(declaration, condition, expr, body);
  }

  fun() {
    this.next();
    const argv = [];
    let body = null;
    const identifier = this.assume();
    this.expect(TokenTypes.LEFT_PAREN, '( expected');
    if (!this.match(TokenTypes.RIGHT_PAREN)) {
      argv.push(this.next());
    }

    while (this.match(TokenTypes.COMMA)) {
      this.next();
      argv.push(this.next());
    }
    this.expect(TokenTypes.RIGHT_PAREN, ') expected');
    body = this.block();

    return new LoxFun(identifier, FunTypes.USER_DEFINED, null, argv.length, argv, body);
  }

  consumeReturn() {
    let expr = null;
    this.expect(TokenTypes.RETURN, 'return expected');
    if (!this.eofStmt()) {
      if (this.match(TokenTypes.FUN)) {
        expr = this.fun();
      } else {
        expr = this.expression();
        this.expect(TokenTypes.SEMICOLON, '; expected');
      }
    } else {
      this.expect(TokenTypes.SEMICOLON, '; expected');
    }
    return new Return(expr);
  }

  declare() {
    this.next();
    const identifier = this.expect(TokenTypes.IDENTIFIER, 'identifier expected');
    let expr = null;
    if (!this.eofStmt()) {
      this.expect(TokenTypes.ASSIGN, '= expected');
      expr = this.expression();
    }
    return new Var(identifier, expr);
  }

  block() {
    this.expect(TokenTypes.LEFT_BRACE, '{ expected');
    let stmts = [];
    stmts = this.program();
    this.expect(TokenTypes.RIGHT_BRACE, '} expected');
    return stmts;
  }

  expression(prec = 0) {
    let expr = this.terminal();

    if (this.eof()) {
      Lox.error('; expected', expr.line, expr.column);
    }

    while (prec < this.getPrec(this.peek())) {
      const operator = this.next();
      // get precedence of current operator;
      // use it to get the next expression
      let newPrec = this.getPrec(operator);
      if (newPrec === 0) break;
      if (operator.type === TokenTypes.POW) newPrec -= 1;
      expr = new Binary(
        expr,
        operator,
        this.expression(newPrec),
        operator.line,
        operator.column,
      );
    }

    return expr;
  }

  terminal() {
    if (this.match(TokenTypes.IDENTIFIER)) {
      const identifier = this.next();
      const args = [];
      if (this.match(TokenTypes.LEFT_PAREN)) {
        this.next();
        if (!this.match(TokenTypes.RIGHT_PAREN)) args.push(this.expression());
        while (this.match(TokenTypes.COMMA)) {
          this.next();
          if (this.match(TokenTypes.FUN)) {
            args.push(this.fun());
          } else args.push(this.expression());
        }
        this.expect(TokenTypes.RIGHT_PAREN, ') expected');
        return new FunCall(identifier, args);
      }

      return new Terminal(
        identifier.type,
        identifier.value,
        identifier.line,
        identifier.column,
      );
    }

    if (this.match(TokenTypes.FUN)) return this.fun();

    if (this.match(TokenTypes.NUMBER, TokenTypes.NIL, TokenTypes.STRING)) {
      const token = this.next();
      return new Terminal(token.type, token.value, token.line, token.column);
    }

    if (this.match(TokenTypes.LEFT_PAREN)) {
      this.next();
      const expr = this.expression();
      this.expect(TokenTypes.RIGHT_PAREN, ') expected');
      return new Group(expr);
    }

    Lox.error(
      `unrecognized value ${this.peek().value}`,
      this.peek().line,
      this.peek().column,
    );
    return null;
  }

  next() {
    return this.tokens[this.current++];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  peek() {
    return this.tokens[this.current];
  }

  eof() {
    return this.current >= this.tokens.length;
  }

  match() {
    for (let i = 0; i < arguments.length; i += 1) {
      if (this.check(arguments[i])) return true;
    }
    return false;
  }

  check(tokenType) {
    if (this.eof()) Lox.error('fatal error');
    return this.tokens[this.current].type === tokenType;
  }

  expect(tokenType, msg) {
    if (!this.eof() && this.peek().type === tokenType) return this.next();
    Lox.error(msg, this.peek().line, this.peek().column);
    return null;
  }

  assume() {
    if (this.match(TokenTypes.IDENTIFIER)) return this.next();
    return new Token(TokenTypes.IDENTIFIER, `anonymous <${Math.random() * 1000}>`, 0, 0);
  }

  eofStmt() {
    return this.tokens[this.current].type === TokenTypes.SEMICOLON;
  }

  eofBlock() {
    if (this.eof()) return true;
    return this.peek().type === TokenTypes.RIGHT_BRACE;
  }

  getPrec(token) {
    switch (token.type) {
      case TokenTypes.ASSIGN:
        return 10;
      case TokenTypes.ARROW:
        return 15;
      case TokenTypes.AND:
      case TokenTypes.OR:
        return 16;
      case TokenTypes.EQUAL_EQUAL:
      case TokenTypes.GREATER:
      case TokenTypes.GREATER_EQUAL:
      case TokenTypes.LESS:
      case TokenTypes.LESS_EQUAL:
        return 17;
      case TokenTypes.BITWISE_AND:
      case TokenTypes.BITWISE_LSHIFT:
      case TokenTypes.BITWISE_RSHIFT:
      case TokenTypes.BITWISE_OR:
        return 18;
      case TokenTypes.PLUS:
      case TokenTypes.MINUS:
        return 20;
      case TokenTypes.MUL:
      case TokenTypes.DIV:
        return 21;
      case TokenTypes.POW:
        return 22;
      default:
        return 0;
    }
  }
}

export { Parser };
