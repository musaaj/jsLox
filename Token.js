import { TokenTypes } from './TokenTypes.js';

class Token {
  constructor(type, value, line, column) {
    this.value = value;
    this.type = type;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `{ type: ${TokenTypes[this.type]}, value: ${this.value}, line: ${
      this.line
    }, column: ${this.column}}`;
  }
}

export { Token };
