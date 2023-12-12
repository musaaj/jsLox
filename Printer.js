import { Lexer } from "./Lexer.js";
import { Parser } from "./parser.js";



class Printer {
	visitTerminal(terminal)
	{
		return terminal.value;
	}

	visitBinary(binary){
		return "(" +  binary.ops.value +
			" "+ this.print(binary.left) +
			" " + this.print(binary.right) +  ")"; 
	}

	visitStatement(statement){
		return "(defvar " +
			" " + this.print(statement.left) +
			" " + this.print(statement.right) +  ")"; 
	}

	print(ast)
	{
		return ast.accept(this);
	}
}

let ast = new Parser(new Lexer("x = y = 3 * 5 - 4 + 4 ^ 9 ^ 4").tokenize()).statement();
console.log(new Printer().print(ast));
