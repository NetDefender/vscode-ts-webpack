type MakeIdOptional<T extends { id: unknown }> = Omit<T, 'id'>
  & Required<Pick<T, 'id'>>

  type TupleToArray<tuple extends string[]> = tuple[number][];

  type Length<tuple extends any[]> = tuple['length'];

  type res1 = Length<[]>;
