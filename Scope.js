class Scope {
  constructor(environment) {
    this.environment = environment;
  }

  next = null;

  get(key) {
    if (this.environment.has(key)) return this.environment.get(key);
    if (this.next) return this.next.get(key);
    return null;
  }

  hasKey(key) {
    if (this.environment.has(key)) return true;
    if (this.next) return this.next.hasKey(key);
    return false;
  }

  set(key, value) {
    this.environment.set(key, value);
  }

  update(key, value) {
    if (this.environment.has(key)) {
      this.environment.set(key, value);
      return;
    }
    if (this.next) {
      this.next.update(key, value);
      return;
    }

    throw Error(`key '${key}' not found`);
  }

  hasKeyInScope(key) {
    return this.environment.has(key);
  }
}

export default Scope;
