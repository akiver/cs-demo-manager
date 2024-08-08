import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { differenceInDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { subtractDateDays } from 'csdm/common/date/subtract-date-days';
import { FilterValue } from 'csdm/ui/components/dropdown-filter/filter-value';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { addDateDays } from 'csdm/common/date/add-date-days';
import { DatePicker } from '../date-picker';
import { ActiveFilterIndicator } from './active-filter-indicator';

type Preset = {
  name: string;
  label: string;
  daysAgo: number | undefined;
};

type FooterProps = {
  startDate: string | undefined;
  endDate: string | undefined;
  selectedPreset: Preset | undefined;
  onPresetClick: (preset: Preset) => void;
  showFilterIndicator?: boolean;
};

function usePeriodPresets() {
  const { t } = useLingui();

  const allTime: Preset = {
    name: 'all-time',
    label: t({
      context: 'Period filter preset',
      message: 'All time',
    }),
    daysAgo: undefined,
  };

  const presets: Preset[] = [
    allTime,
    {
      name: 'today',
      label: t({
        context: 'Period filter preset',
        message: 'Today',
      }),
      daysAgo: 0,
    },
    {
      name: 'last-week',
      label: t({
        context: 'Period filter preset',
        message: 'Last week',
      }),
      daysAgo: 7,
    },
    {
      name: 'last-month',
      label: t({
        context: 'Period filter preset',
        message: 'Last month',
      }),
      daysAgo: 30,
    },
    {
      name: 'last-3-month',
      label: t({
        context: 'Period filter preset',
        message: 'Last 3 month',
      }),
      daysAgo: 90,
    },
    {
      name: 'last-year',
      label: t({
        context: 'Period filter preset',
        message: 'Last year',
      }),
      daysAgo: 365,
    },
    {
      name: 'last-2-years',
      label: t({
        context: 'Period filter preset',
        message: 'Last 2 years',
      }),
      daysAgo: 365 * 2,
    },
    {
      name: 'last-5-years',
      label: t({
        context: 'Period filter preset',
        message: 'Last 5 years',
      }),
      daysAgo: 365 * 5,
    },
  ];

  return { presets, allTime };
}

function Footer({ startDate, endDate, selectedPreset, onPresetClick, showFilterIndicator = true }: FooterProps) {
  const { presets } = usePeriodPresets();
  const formatDate = useFormatDate();

  return (
    <div className="flex flex-col mt-8 gap-y-8">
      <div className="flex flex-wrap gap-8 max-w-[270px]">
        {presets.map((preset) => {
          const onClick = () => {
            onPresetClick(preset);
          };
          const isSelected = selectedPreset?.name === preset.name;
          return (
            <FilterValue key={preset.name} isSelected={isSelected} onClick={onClick}>
              <span>{preset.label}</span>
            </FilterValue>
          );
        })}
      </div>
      {startDate && endDate && (
        <div className="flex items-center gap-x-8">
          <div>
            <span>{formatDate(startDate, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
            <span> - </span>
            <span>{formatDate(endDate, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
          </div>
          {showFilterIndicator && <ActiveFilterIndicator />}
        </div>
      )}
    </div>
  );
}

type Props = {
  startDate: string | undefined;
  endDate: string | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  isDisabled?: boolean;
  showFilterIndicator?: boolean;
};

export function PeriodFilter({ isDisabled, startDate, endDate, onRangeChange, showFilterIndicator }: Props) {
  const { presets, allTime } = usePeriodPresets();
  let selectedPreset: Preset | undefined = allTime;
  if (startDate) {
    const diffDays = Math.abs(differenceInDays(startDate, new Date()));
    selectedPreset = presets.find((preset) => {
      return preset.daysAgo !== undefined && Math.abs(preset.daysAgo - diffDays) === 0;
    });
  }

  const onPresetClick = (preset: Preset) => {
    if (isDisabled) {
      return;
    }
    if (preset.daysAgo === undefined) {
      onRangeChange(undefined);
      return;
    }

    const now = new Date();
    const newFrom = subtractDateDays(now, preset.daysAgo);
    const newTo = addDateDays(now, 1);
    onRangeChange({
      from: newFrom,
      to: newTo,
    });
  };

  return (
    <DatePicker
      startDate={startDate}
      endDate={endDate}
      isDisabled={isDisabled}
      onRangeChange={onRangeChange}
      footer={
        <Footer
          startDate={startDate}
          endDate={endDate}
          selectedPreset={selectedPreset}
          onPresetClick={onPresetClick}
          showFilterIndicator={showFilterIndicator}
        />
      }
    />
  );
}
