import { useLocale } from 'csdm/ui/settings/ui/use-locale';

export function useFormatDate() {
  const locale = useLocale();
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  return (date: Date | string, options: Intl.DateTimeFormatOptions = defaultOptions) => {
    return new Intl.DateTimeFormat(locale, {
      ...defaultOptions,
      ...options,
    }).format(typeof date === 'string' ? new Date(date) : date);
  };
}
