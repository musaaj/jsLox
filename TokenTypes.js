let TokenTypes =(function(TokenType = [])
{
	TokenType[TokenType["PLUS"]  = 0] = "PLUS";
	TokenType[TokenType["MINUS"]  = 1] = "MINUS";
	TokenType[TokenType["MUL"]  = 2] = "MUL";
	TokenType[TokenType["DIV"]  = 3] = "DIV";
	TokenType[TokenType["POW"]  = 4] = "POW";
	TokenType[TokenType["NUMBER"] = 5] = "NUMBER";
	TokenType[TokenType["IDENTIFIER"] = 6] = "IDENTIFIER";
	TokenType[TokenType["ASSIGN"] = 7] = "ASSIGN";
	TokenType[TokenType["SEMICOLON"] = 7] = "SEMICOLON";

	return TokenType;
}());

export {TokenTypes};
