// Returns the index of the last item with a tick lower than or equal to the given tick, -1 if there is none.
// Items must be sorted by tick.
export function findLastIndexAtOrBeforeTick(items: { tick: number }[], tick: number) {
  let low = 0;
  let high = items.length - 1;
  let index = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (items[middle].tick <= tick) {
      index = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return index;
}
