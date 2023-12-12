let TokenTypes =(function(TokenType = [])
{
	TokenType[TokenType["PLUS"]  = 0] = "PLUS";
	TokenType[TokenType["MINUS"]  = 1] = "MINUS";
	TokenType[TokenType["MUL"]  = 2] = "MUL";
	TokenType[TokenType["DIV"]  = 3] = "DIV";
	TokenType[TokenType["POW"]  = 4] = "POW";
	TokenType[TokenType["NUMBER"] = 5] = "NUMBER";
	return TokenType;
}());

console.log(TokenTypes);
export {TokenTypes};
