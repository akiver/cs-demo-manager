import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { HeatmapTimeRange } from 'csdm/common/types/heatmap-time-range';
import { RangeSlider, type RangeSliderMark, type RangeSliderValue } from 'csdm/ui/components/inputs/range-slider';

type Props = {
  timeRange: HeatmapTimeRange;
  maxSeconds: number; // Duration of the longest round the slider applies to
  bombPlantSeconds: number | null; // Displayed as a mark on the slider
  onChange: (timeRange: HeatmapTimeRange) => void;
};

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function HeatmapTimeRangeSlider({ timeRange, maxSeconds, bombPlantSeconds, onChange }: Props) {
  const { t } = useLingui();
  // Value displayed while a thumb is being dragged, the time range is updated only when the thumb is released.
  const [draftValue, setDraftValue] = useState<RangeSliderValue | null>(null);
  const max = Math.max(1, Math.ceil(maxSeconds));
  const end = Math.min(timeRange.endSeconds ?? max, max);
  const value: RangeSliderValue = draftValue ?? [Math.min(timeRange.startSeconds, end), end];

  const marks: RangeSliderMark[] = [];
  if (bombPlantSeconds !== null && bombPlantSeconds > 0 && bombPlantSeconds < max) {
    const plantTime = formatSeconds(bombPlantSeconds);
    marks.push({
      value: bombPlantSeconds,
      label: t`Bomb planted at ${plantTime}`,
    });
  }

  return (
    <RangeSlider
      label={<Trans context="Input label">Time range</Trans>}
      min={0}
      max={max}
      value={value}
      formatValue={formatSeconds}
      marks={marks}
      onValueChange={setDraftValue}
      onValueCommitted={([startSeconds, endSeconds]) => {
        setDraftValue(null);
        onChange({
          startSeconds,
          endSeconds: endSeconds >= max ? null : endSeconds,
        });
      }}
    />
  );
}
