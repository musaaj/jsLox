import Scope from './Scope.js';

class Environment {
  scope = new Scope(new Map());

  get(key) {
    return this.scope.get(key);
  }

  set(key, value) {
    this.scope.set(key, value);
  }

  hasKey(key) {
    return this.scope.hasKey(key);
  }

  hasKeyInScope(key) {
    return this.scope.hasKeyInScope(key);
  }

  newScope() {
    const scope = new Scope(new Map());
    scope.next = this.scope;
    this.scope = scope;
  }

  removeScope() {
    const scope = this.scope;
    this.scope = this.scope.next;
    scope.next = null;
    return scope;
  }

  update(key, value) {
    this.scope.update(key, value);
  }

  pushScope(scope) {
    const newScope = new Scope(scope.environment);
    newScope.next = this.scope;
    this.scope = newScope;
  }
}

export { Environment };
