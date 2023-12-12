class Binary {
	constructor(left, ops, right, line, column)
	{
		this.left = left;
		this.ops = ops;
		this.right = right;
		this.line = line;
		this.column = column;
	}

	accept(visitor)
	{
		return visitor.visitBinary(this);
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

	accept(visitor)
	{
		visitor.visitTerminal();
	}
}

class Statement extends Binary{

	accept(visitor)
	{
		visitor.visitorStatement();
	}
}

export { Binary, Terminal, Statement };
