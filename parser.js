class Parser {
	tokens = [];
	current = 0;
	constructor(tokens)
	{
		this.tokens = tokens;
	}

	expression()
	{
		return this.comparison();
	}

	comparison()
	{
		let expr = this.factor();
		while(["<", ">", ">=","<=", "!=", "=="].indexOf(this.peek()) >= 0)
		{
			let ops = this.advance()
			const right = this.factor();
			expr = new Binary(expr, ops, right); 
		}
		return expr;
	}

	factor()
	{
		let expr = this.term();
		while(this.peek() == "+" || this.peek() == "-"){
			let ops = this.advance();
			const right = this.term()
			expr = new Binary(expr, ops, right);
		}

		return expr;
	}

	term()
	{
		let exp = this.terminal();
		while(this.peek() == "/" || this.peek() == "*")
		{
			let ops = this.advance();
			const right = this.terminal();
			exp = new Binary(exp, ops, right);
		}
		return exp;
	}

	terminal()
	{
		return new Value(this.advance());
	}

	advance()
	{
		if (this.eof()) return null;
		return this.tokens[this.current++];
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

class Binary {
	constructor(left, ops, right)
	{
		this.left = left;
		this.ops = ops;
		this.right = right;
	}

	toString()
	{
		return `(${this.ops} ${this.left.toString()} ${this.right.toString()})`;
	}

	interprete()
	{
		switch(this.ops)
		{
			case "+":
				return this.left.interprete() + this.right.interprete();
			case "-":
				return this.left.interprete() - this.right.interprete();
			case "*":
				return this.left.interprete() * this.right.interprete();
			case "/":
				return this.left.interprete() / this.right.interprete();
		  case "==":
				return this.left.interprete() == this.right.interprete();
		}
	}
}

class Value {
	constructor(val)
	{
		this.val = val;
	}

	interprete()
	{
		return this.val;
	}

	toString()
	{
		return this.val.toString();
	}
}

let ps = new Parser([2, "+", 3, "+", 3, "==", 4, "/", 5]);

let expr = ps.expression()
console.log(expr.toString(), expr.interprete());
