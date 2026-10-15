function getLevenshteinDistance(a: string, b: string) {
  let previousRow = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const currentRow = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(previousRow[j] + 1, currentRow[j - 1] + 1, previousRow[j - 1] + substitutionCost);
    }
    previousRow = currentRow;
  }

  return previousRow[b.length];
}

/**
 * Returns the name closest to the given input, used to suggest a command or an option when the user makes a typo.
 * Returns undefined when no name is close enough to be a likely typo.
 */
export function findSimilarName(input: string, names: string[]) {
  const maxDistance = 2;
  let closestName: string | undefined;
  let closestDistance = Infinity;
  for (const name of names) {
    const distance = getLevenshteinDistance(input.toLowerCase(), name.toLowerCase());
    if (distance < closestDistance) {
      closestName = name;
      closestDistance = distance;
    }
  }

  return closestDistance <= maxDistance ? closestName : undefined;
}
