export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export function formatDate(date: Date | undefined): string | undefined {
  return date?.toLocaleDateString('fr-CA');
}
