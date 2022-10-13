function Iterator() {
  function *fib(i: number): IterableIterator<number>{
    yield i;
    yield i-1;
  }

  const it: IterableIterator<number> = fib(2);
  console.log(it.next());
  console.log(it.next());
}

function Iterable() {
  const collection = {
    *[Symbol.iterator]() {
      for(let i: number = 0; i < 10; i++) {
        yield i;
      }
    }
  };

  for(let a of collection) {
    console.log(a);
  }
}
