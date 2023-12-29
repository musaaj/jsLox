class Program {
  stmts = [];

  constructor(stmts) {
    this.stmts = stmts;
  }

  accept(visitor) {
    return visitor.visitProgram(this);
  }
}

class Return
{
  constructor(expr) {
    this.expr = expr;
  }

  accept(visitor) {
    return visitor.visitReturn(this);
  }
}

class LoxFun {
  constructor(identifier, type, value, argc, argv, body) {
    this.identifier = identifier;
    this.type = type;
    this.value = value;
    this.argc = argc;
    this.argv = argv;
    this.body = body;
    this.enclosed = false;
    this.closure = null;
  }

  accept(visitor) {
    return visitor.visitFun(this);
  }

  toString() {
    return 'Function <' + this.identifier.value + '>';
  }
}

class If {
  constructor(condition, thenBranch, elseBranch) {
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor) {
    return visitor.visitIf(this);
  }
}

class While {
  constructor(condition, body) {
    this.condition = condition;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitWhile(this);
  }
}

class For {
  constructor(declaration, condition, expr, body) {
    this.declaration = declaration;
    this.condition = condition;
    this.expr = expr;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitFor(this);
  }
}

class FunCall {
  constructor(identifier, args) {
    this.identifier = identifier;
    this.args = args;
  }

  accept(visitor) {
    return visitor.visitFunCall(this);
  }
}

class Binary {
  constructor(left, ops, right, line, column) {
    this.left = left;
    this.ops = ops;
    this.right = right;
    this.line = line;
    this.column = column;
  }

  accept(visitor) {
    return visitor.visitBinary(this);
  }
}

class Terminal {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  accept(visitor) {
    return visitor.visitTerminal(this);
  }
}

class Statement extends Binary {
  accept(visitor) {
    return visitor.visitStatement(this);
  }
}

class Group {
  constructor(expr) {
    this.expr = expr;
  }

  accept(visitor) {
    return visitor.visitGroup(this);
  }
}

class Var {
  constructor(identifier, right) {
    this.identifier = identifier;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitVar(this);
  }
}

export {
  Binary,
  Terminal,
  Statement,
  Group,
  Var,
  Program,
  If,
  While,
  For,
  FunCall,
  LoxFun,
  Return,
};
