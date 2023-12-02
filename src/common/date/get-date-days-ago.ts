export function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date;
}
