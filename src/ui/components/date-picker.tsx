import React, { type ReactNode } from 'react';
import { enUS, fr, zhCN, ptBR, de } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { useLocale } from 'csdm/ui/settings/ui/use-locale';

function getFnsLocale(locale: string) {
  switch (locale) {
    case 'fr':
      return fr;
    case 'pt-BR':
      return ptBR;
    case 'zh-CN':
      return zhCN;
    case 'de':
      return de;
    default:
      return enUS;
  }
}

type Props = {
  startDate: string | undefined;
  endDate: string | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  isDisabled?: boolean;
  footer?: ReactNode;
};

export function DatePicker({ isDisabled, startDate, endDate, onRangeChange, footer }: Props) {
  const locale = useLocale();
  const range: DateRange | undefined = {
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  };
  const csgoReleaseDate = new Date(2011, 10, 30); // Wednesday 30 November 2011, CSGO private beta release date

  return (
    <DayPicker
      disabled={isDisabled}
      mode="range"
      footer={footer}
      showOutsideDays={true}
      captionLayout="dropdown-buttons"
      selected={range}
      onSelect={onRangeChange}
      fromYear={csgoReleaseDate.getFullYear()}
      toYear={new Date().getFullYear()}
      hidden={{
        before: csgoReleaseDate,
      }}
      locale={getFnsLocale(locale)}
    />
  );
}
