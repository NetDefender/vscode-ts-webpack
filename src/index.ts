type Options = 'a' | 'b' | 'c'

type RemoveOption<T, TOption> = T extends TOption ? never : T;

type s = RemoveOption<Options, 'c' | 'b'>

class Flies {
  fly() {
    alert('Is it a bird? Is it a plane?');
  }
}
class Climbs {
  climb() {
    alert('My spider-sense is tingling.');
  }
}
class Bulletproof {
  deflect() {
    alert('My wings are a shield of steel.');
  }
}

type AB = Flies & Climbs;


