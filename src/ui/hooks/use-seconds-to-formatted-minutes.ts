import { useLocale } from 'csdm/ui/settings/ui/use-locale';

export function useSecondsToFormattedMinutes() {
  const locale = useLocale();

  return (seconds: number, formatting: 'short' | 'long' | 'narrow' = 'long'): string => {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      style: 'unit',
      unit: 'minute',
      unitDisplay: formatting,
    }).format(seconds / 60);
  };
}
