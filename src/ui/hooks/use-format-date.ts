import { format } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { useLocale } from 'csdm/ui/settings/ui/use-locale';
import { useUiSettings } from 'csdm/ui/settings/ui/use-ui-settings';

export function useFormatDate() {
  const locale = useLocale();
  const { dateFormat, dateTimezone } = useUiSettings();
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  return (date: Date | string, options: Intl.DateTimeFormatOptions = defaultOptions) => {
    const finalDate = typeof date === 'string' ? new Date(date) : date;
    if (typeof dateFormat === 'string') {
      try {
        return format(dateTimezone ? new TZDate(finalDate, dateTimezone) : finalDate, dateFormat);
      } catch (error) {
        // fallback to default formatting if the custom format is invalid
        logger.error('Invalid date format in settings');
        logger.error(dateFormat);
        logger.error(error);
      }
    }

    return new Intl.DateTimeFormat(locale, {
      ...defaultOptions,
      ...options,
      ...(dateTimezone ? { timeZone: dateTimezone } : {}),
    }).format(finalDate);
  };
}
