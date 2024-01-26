import { argv, exit } from "node:process";
import { readFileSync } from "node:fs";
import readline from "readline-sync";
import { Lexer } from "./Lexer.js";
import { Parser } from "./prattParser.js";
import Interpreter from "./Interpreter.js";
import env from "./lib.js";

class Lox {
  static env = env;

  static hasError = false;

  static main() {
    console.log('SimpleCalc v0.1');
    const interpreter = new Interpreter(this.env);
    while (true) {
      const args = readline.question('>> ').trim();
      if (!args) Lox.hasError = true;

      try {
        const tokens = new Lexer(args).tokenize();
        let ast;
        if (!Lox.hasError) ast = new Parser(tokens).statement();

        if (!Lox.hasError) {
          interpreter.interprete(ast);
        }
      } catch (e) {
        console.log(e);
      }
      Lox.hasError = false;
    }
  }

  static runFile(filename) {
    try {
      const file = Lox.read(filename);
      const tokens = new Lexer(file).tokenize();
      const ast = new Parser(tokens).program();
      if (1) new Interpreter(env).evaluate(ast);
      exit(0);
    } catch (e) {
      console.log(e);
      exit(64);
    }
  }

  static read(filename) {
    const txt = readFileSync(filename, { flag: 'r', encoding: 'utf8' });
    return txt.trim();
  }

  static error(msg, line, column) {
    this.hasError = true;
    console.log(`Error: ${line} : ${column} ${msg}`);
  }
}

export { Lox };

if (argv.length === 3) {
  Lox.runFile(argv[2]);
} else {
  Lox.main();
}
