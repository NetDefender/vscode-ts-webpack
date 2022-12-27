type ClassConstructor<T> = new (...args: any[]) => T;

export function withEZDebug<
  C extends ClassConstructor<{ getDebugValue(): object }>
>(constructorFunction: C) {
  return class extends constructorFunction {
    constructor(...args: any[]) {
      super(...args);
    }

    debug(): string {
      let name: string = constructorFunction.constructor.name;
      return name;
    }
  };
}
