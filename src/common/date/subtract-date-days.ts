export function subtractDateDays(date: Date, days: number) {
  const newDate = new Date();
  newDate.setDate(date.getDate() - days);

  return newDate;
}
