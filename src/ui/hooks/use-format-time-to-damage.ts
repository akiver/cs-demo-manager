import { useLocale } from 'csdm/ui/settings/ui/use-locale';

type Options = {
  showUnit?: boolean;
};

export function useFormatTimeToDamage({ showUnit = true }: Options = {}) {
  const locale = useLocale();

  return (milliseconds: number | null): string => {
    if (milliseconds === null) {
      return '-';
    }

    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      ...(showUnit && { style: 'unit', unit: 'millisecond', unitDisplay: 'short' }),
    }).format(milliseconds);
  };
}
