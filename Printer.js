class Printer {
	visitTerminal(terminal)
	{
		return terminal.value;
	}

	visitBinary(binary){
		return "(" +  binary.ops.value +
			" "+ binary.left.accept(this) +
			" " + binary.right.accept(this) +  ")"; 
	}

	visitBinary(statement){
		return "(" +  binary.ops.value +
			" "+ statement.left.accept(this) +
			" " + statement.right.accept(this) +  ")"; 
	}

	print(ast)
	{
		ast.accept(this);
	}
}
