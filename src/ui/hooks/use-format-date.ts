import { useCallback } from 'react';
import { useLocale } from 'csdm/ui/settings/ui/use-locale';

export function useFormatDate() {
  const locale = useLocale();

  return useCallback(
    (
      date: Date | string,
      options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      },
    ) => {
      return new Intl.DateTimeFormat(locale, options).format(typeof date === 'string' ? new Date(date) : date);
    },
    [locale],
  );
}
