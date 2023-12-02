/**
 * Return the unique values found in the passed array.
 */
export function uniqueArray<Type extends string | number>(values: Array<Type>) {
  return [...new Set(values)];
}
