import { Environment } from './Environment.js';
import { LoxFun } from './Expr.js';
import FunTypes from './FunTypes.js';
import { Token } from './Token.js';

const env = new Environment();

function print() {
  let args = [];
  for (let i = 0; i < arguments.length; i++) {
    args.push(arguments[i]?.toString());
  }
  console.log(...args);
}
const printFun = new LoxFun(
  new Token(FunTypes.BUILTIN, 'print', 0, 0),
  FunTypes.BUILTIN,
  print,
  null,
  null,
  null,
);

env.set('print', printFun);

export default env;
