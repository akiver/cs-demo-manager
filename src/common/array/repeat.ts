/**
 * Return an array containing the passed value repeated count times.
 */
export function repeat<Type>(value: Type, count: number) {
  return Array.from<Type>({ length: count }).fill(value);
}
