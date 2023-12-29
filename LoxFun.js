class LoxFun {
  constructor(name, type, value, argc, argv, body) {
    this.name = name;
    this.type = type;
    this.value = value;
    this.argc = argc;
    this.argv = argv;
    this.body = body;
  }

  toString() {
    return `Function <${this.name}>`;
  }
}

export default LoxFun;
