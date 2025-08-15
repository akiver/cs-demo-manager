import { useLocale } from 'csdm/ui/settings/ui/use-locale';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';

const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

export function useUnixTimestampToHumanizedDate() {
  const locale = useLocale();

  return (unixTimestamp: number, options: Intl.DateTimeFormatOptions = DEFAULT_FORMAT_OPTIONS) => {
    return new Intl.DateTimeFormat(locale, options).format(unixTimestampToDate(unixTimestamp));
  };
}
