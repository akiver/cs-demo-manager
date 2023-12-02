export function getDateTimestampAtMidnight(date: Date) {
  return Number.parseInt((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000).toFixed(0));
}
