export function areArraysValuesTheSame(a: unknown[], b: unknown[]) {
  if (a.length !== b.length) {
    return false;
  }

  const difference = a.filter((value) => {
    return !b.includes(value);
  });

  return difference.length === 0;
}
