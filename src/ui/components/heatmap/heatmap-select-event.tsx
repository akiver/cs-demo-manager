import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';

type Props = {
  event: HeatmapEvent;
  onChange: (event: HeatmapEvent) => void;
};

export function HeatmapSelectEvent({ event, onChange }: Props) {
  const { t } = useLingui();

  const eventMessage: Record<HeatmapEvent, string> = {
    [HeatmapEvent.Kills]: t({
      context: 'Heatmap event',
      message: 'Kills',
    }),
    [HeatmapEvent.Deaths]: t({
      context: 'Heatmap event',
      message: 'Deaths',
    }),
    [HeatmapEvent.Shots]: t({
      context: 'Heatmap event',
      message: 'Shots',
    }),
    [HeatmapEvent.HeGrenade]: t({
      context: 'Heatmap event',
      message: 'HE',
    }),
    [HeatmapEvent.Flashbang]: t({
      context: 'Heatmap event',
      message: 'Flashbang',
    }),
    [HeatmapEvent.Smoke]: t({
      context: 'Heatmap event',
      message: 'Smoke',
    }),
    [HeatmapEvent.Molotov]: t({
      context: 'Heatmap event',
      message: 'Molotov',
    }),
    [HeatmapEvent.Decoy]: t({
      context: 'Heatmap event',
      message: 'Decoy',
    }),
  };

  const options: SelectOption<HeatmapEvent>[] = Object.values(HeatmapEvent).map((event) => {
    return {
      label: eventMessage[event],
      value: event,
    };
  });

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Event</Trans>
      </InputLabel>
      <Select onChange={onChange} value={event} options={options} />
    </div>
  );
}
