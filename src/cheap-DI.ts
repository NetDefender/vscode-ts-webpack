import "reflect-metadata";

interface Type<T> {
  new (...args: any[]): T;
}

type GenericClassDecorator<T> = (target: T) => void;

const Service = (): GenericClassDecorator<Type<object>> => {
  return (target) => {
    console.log(Reflect.getMetadata("design:paramtypes", target));
  };
};

const Injector = new (class {
  resolve<T>(constructor: Type<any>): T {
    const dependencies: any[] =
      Reflect.getMetadata("design:paramtypes", constructor) || [];
    const childDependencies = dependencies.map((dependency) =>
      Injector.resolve<any>(dependency)
    );

    return new constructor(...childDependencies);
  }
})();

@Service()
class ApiService {
  constructor() {}
}

@Service()
class Role {
  constructor(private apiService: ApiService) {}
}

const r = new Role(new ApiService());

const instance = Injector.resolve<Role>(Role);
console.log(instance);
