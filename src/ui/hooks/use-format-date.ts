import { format } from 'date-fns';
import { useLocale } from 'csdm/ui/settings/ui/use-locale';
import { useUiSettings } from 'csdm/ui/settings/ui/use-ui-settings';

export function useFormatDate() {
  const locale = useLocale();
  const { dateFormat } = useUiSettings();
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  return (date: Date | string, options: Intl.DateTimeFormatOptions = defaultOptions) => {
    if (typeof dateFormat === 'string') {
      try {
        return format(typeof date === 'string' ? new Date(date) : date, dateFormat);
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
    }).format(typeof date === 'string' ? new Date(date) : date);
  };
}
