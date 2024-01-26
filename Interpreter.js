import { TokenTypes } from './TokenTypes.js';
import { Lox } from './Lox.js';
import { LoxFun, Return } from './Expr.js';
import FunTypes from './FunTypes.js';

class Interpreter {
  isInFunction = false;
  constructor(env) {
    this.env = env;
  }

  visitTerminal(terminal) {
    if (terminal.type === TokenTypes.NUMBER) return Number(terminal.value);
    if (terminal.type === TokenTypes.STRING) return terminal.value;
    if (terminal.type === TokenTypes.NIL) return null;
    if (terminal.type === TokenTypes.IDENTIFIER) {
      const value = this.env.get(terminal.value);

      if (!this.env.hasKey(terminal.value)) {
        Lox.error(
          `undeclared identifier ${terminal.value}`,
          terminal.line,
          terminal.column,
        );
      }

      if (value == null) {
        Lox.error(
          `uninitialized identifier ${terminal.value}`,
          terminal.line,
          terminal.column,
        );
      }
      return value;
    }

    Lox.error(
      `syntax error '${terminal.value}'`,
      terminal.line,
      terminal.column,
    );
  }

  visitBinary(binary) {
    if (binary.ops.type === TokenTypes.ASSIGN) {
      const identifier = binary.left;
      const value = this.evaluate(binary.right);

      if (identifier.type !== TokenTypes.IDENTIFIER) {
        Lox.error(
          `invalid assignment to '${identifier.value}'`,
          identifier.line,
          identifier.column,
        );
      }

      if (!this.env.hasKey(identifier.value)) {
        Lox.error(
          `undeclared identifier '${identifier.value}'`,
          identifier.line,
          identifier.column,
        );
      }

      this.env.update(identifier.value, value);
      return value;
    }

    const left = this.evaluate(binary.left);
    const right = this.evaluate(binary.right);

    switch (binary.ops.type) {
      case TokenTypes.PLUS:
        return left + right;
      case TokenTypes.MINUS:
        return left - right;
      case TokenTypes.MUL:
        return left * right;
      case TokenTypes.DIV:
        return left / right;
      case TokenTypes.POW:
        return left ** right;
      case TokenTypes.MOD:
        return left % right;
      case TokenTypes.BITWISE_OR:
        return left | right;
      case TokenTypes.BITWISE_AND:
        return left & right;
      case TokenTypes.BITWISE_RSHIFT:
        return left >> right;
      case TokenTypes.BITWISE_LSHIFT:
        return left << right;
      case TokenTypes.EQUAL_EQUAL:
        return left == right;
      case TokenTypes.GREATER:
        return left > right;
      case TokenTypes.LESS:
        return left < right;
      case TokenTypes.GREATER_EQUAL:
        return left >= right;
      case TokenTypes.LESS_EQUAL:
        return left <= right;
      case TokenTypes.AND:
        return left && right;
      case TokenTypes.OR:
        return left || right;
      default:
        Lox.error(
          `unrecognized operator ${binary.ops.value}`,
          binary.ops.line,
          binary.ops.column,
        );
    }
  }

  assign(statement) {
    if (!this.env.hasKey(statement.left.value)) {
      Lox.error(
        `undeclared variable '${statement.left.value}'`,
        statement.left.line,
        statement.left.column,
      );
      return null;
    }
    this.env.update(statement.left.value, this.evaluate(statement.right));
    return null;
  }

  visitGroup(group) {
    return this.evaluate(group.expr);
  }

  visitVar(_var) {
    const identifier = _var.identifier.value;

    if (this.env.hasKeyInScope(identifier)) {
      Lox.error(
        `${identifier} already declared`,
        _var.identifier.line,
        _var.identifier.column,
      );
    }
    this.env.set(
      identifier,
      _var.right ? this.evaluate(_var.right) : undefined,
    );
    return null;
  }

  visitProgram(program) {
    const { stmts } = program;
    let result = null;
    this.env.newScope();
    for (let i = 0; i < stmts.length; i += 1) {
      if (stmts[i] instanceof Return) {
        return stmts[i].expr ? this.evaluate(stmts[i].expr) : null;
      }
      result = this.evaluate(stmts[i]);
    }
    this.env.removeScope();
    return result;
  }

  visitIf(_if) {
    const condition = this.evaluate(_if.condition);
    if (condition) {
      return this.evaluate(_if.thenBranch);
    } else if(_if.elseBranch) {
      return this.evaluate(_if.elseBranch);
    }
    return null;
  }

  visitWhile(_while) {
    let result = null;
    while (this.evaluate(_while.condition)) {
      result = this.evaluate(_while.body);
    }
    return result;
  }

  visitFor(_for) {
    let result = null;
    this.env.newScope();
    this.evaluate(_for.declaration);
    while (this.evaluate(_for.condition)) {
      result = this.evaluate(_for.body);
      this.evaluate(_for.expr);
    }
    this.env.removeScope();

    return result;
  }

  visitFunCall(funcall) {
    const funName = funcall.identifier;
    let result = null;
    if (!this.env.hasKey(funName.value)) {
      Lox.error(`undeclared function ${funName.value}`);
    }
    const fun = this.env.get(funName.value);
    if (!(fun instanceof LoxFun)) {
      Lox.error(`undeclared function '${funName.value}'`);
    }

    const args = funcall.args.map((arg) => this.evaluate(arg));
    if (fun.type === FunTypes.BUILTIN) {
      return fun.value(...args);
    }
    if (fun.type === FunTypes.USER_DEFINED) {
      this.isInFunction = true;
      if (args.length !== fun.argv.length) {
        Lox.error(`arguments to '${funName.value}' not marched`, funName.line, funName.column);
        this.isInFunction = false;
        return null;
      }

      const { argv, body } = fun;

      if (fun.enclosed) this.env.pushScope(fun.closure);
      this.env.newScope();
      for (let i = 0; i < args.length; i += 1) {
        this.env.set(argv[i].value, args[i]);
      }
      for (let i = 0; i < body.stmts.length; i += 1) {
        result = this.evaluate(body.stmts[i]);
        if (!this.isInFunction) {
          const scope = this.env.removeScope();
          if (result instanceof LoxFun) {
            result.enclosed = true;
            result.closure = scope;
          }
          return result;
        }
      }
      this.env.removeScope();
    }
    this.isInFunction = false;
    this.env.removeScope();
    return result;
  }

  visitFun(fun) {
    const { identifier } = fun;
    if (this.env.hasKeyInScope(identifier.value)) {
      Lox.error(`'${identifier.value}' already declared`);
    }
    this.env.set(identifier.value, fun);
    return this.env.get(identifier.value);
  }

  visitReturn(_return) {
    let result = null;
    if (!this.isInFunction) {
      Lox.error('return can only be executed inside a function');
      return null;
    }
    if (_return.expr) result = this.evaluate(_return.expr);
    this.isInFunction = false;
    return result;
  }

  evaluate(ast) {
    return ast.accept(this);
  }

  interprete(ast) {
    const value = this.evaluate(ast);
    if (value === Infinity || value === -Infinity) console.log('nil');
    else if (value === false) console.log(value);
    else if (value == null) console.log('nil');
		else if (value instanceof LoxFun) console.log(value.toString());
    else console.log(value);
  }
}

export default Interpreter;
