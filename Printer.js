class Printer {
  visitTerminal(terminal) {
    return terminal.value;
  }

  visitBinary(binary) {
    return (
      '(' +
      binary.ops.value +
      ' ' +
      this.print(binary.left) +
      ' ' +
      this.print(binary.right) +
      ')'
    );
  }

  visitStatement(statement) {
    return (
      '(setq ' +
      ' ' +
      this.print(statement.left) +
      ' ' +
      this.print(statement.right) +
      ')'
    );
  }

  visitGroup(group) {
    return '(progn ' + this.visitBinary(group.expr) + ')';
  }

  visitVar(expr) {
    return (
      '(defvar ' + expr.identifier.value + ' ' + this.print(expr.right) + ')'
    );
  }

  visitProgram(program) {
    return (
      '(program\n' +
      program.stmts.map((expr) => this.print(expr)).join('\n') +
      ')'
    );
  }

  print(ast) {
    return ast.accept(this);
  }
}

export { Printer };
