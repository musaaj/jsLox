const VAR = 0;
const COMMA = 1;

function Enum(keys = '') {
  let props = parse(keys);
  let _enum = {};
  props.forEach(
    (key, idx) => (_enum[(_enum[key] = idx)] = key),
  );
  return _enum;
}

function parse(input = "") {
	let tokens = scan(input);
	let ast = [];
	if(!tokens.length) throw "empty enum not allowed";
	let i = 0;
	ast.push(tokens[i].value); i++;
	while(tokens[i] && tokens[i].type == COMMA) {
		i++;
		if (tokens[i] && tokens[i].type != VAR) throw "invalid enum key";
		if (!tokens[i]) break;
		ast.push(tokens[i].value);
		i++;
	}
	if (tokens[i]) {
		if (tokens[i].type != VAR) throw "invalid enum key";
		ast.push(tokens[i].value);
	}
	return ast;
}

function scan(input="") {
	let tokens = [];
	let i = 0;
	while (i < input.length) {
		let token = [];
		while(input[i] && isSpace(input[i])) i++;
		if (input[i] && isAlpha(input[i])) {
			while(input[i] && isIdent(input[i])) token.push(input[i++]);
			tokens.push(Token(VAR, token.join("")));
		} else if(input[i] && input[i] == ",") {
			tokens.push(Token(COMMA, input[i++]))
		} else if(input[i]) {
			throw "invalid token: " + input[i];
		}
	}
	return tokens;
}

function Token(type, value){
	return {type: type,value: value};
}

function isSpace(c="") {
	return c == " " || c == "\n" || c == "\t";
}

function isAlpha(c="") {
	return (c.charCodeAt(0) >= "A".charCodeAt(0) && c.charCodeAt(0) <= "Z".charCodeAt(0)) || (c.charCodeAt(0) >= "a".charCodeAt(0) && c.charCodeAt(0) <= "z".charCodeAt(0));
}

function isDigit(c="") {
	return c.charCodeAt(0) >= "0".charCodeAt(0) && c.charCodeAt(0) <= "9".charCodeAt(0);
}

function isIdent(c="") {
	return isAlpha(c) || isDigit(c) || c == "_";
}
export { Enum };
