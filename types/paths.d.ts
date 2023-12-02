// Infer a union type of object properties including nested with dot notation.
// https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

// Infer only to 3 objects deep
type Prev = [never, 0, 1, 2, 3, ...0[]];

type Paths<T, D extends number = 3> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never;
      }[keyof T]
    : '';
