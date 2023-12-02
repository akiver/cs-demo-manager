export function dateToUnixTimestamp(date: Date) {
  return Number.parseInt((date.getTime() / 1000).toFixed(0));
}
