export function lastArrayItem<Type>(array: Type[]): Type {
  if (array.length === 0) {
    throw new Error('Array is empty');
  }

  return array.at(-1) as Type;
}
