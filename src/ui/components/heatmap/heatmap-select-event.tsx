import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  event: HeatmapEvent;
  onChange: (event: HeatmapEvent) => void;
};

export function HeatmapSelectEvent({ event, onChange }: Props) {
  const _ = useI18n();

  const eventMessage: Record<HeatmapEvent, string> = {
    [HeatmapEvent.Kills]: _(
      msg({
        context: 'Heatmap event',
        message: 'Kills',
      }),
    ),
    [HeatmapEvent.Deaths]: _(
      msg({
        context: 'Heatmap event',
        message: 'Deaths',
      }),
    ),
    [HeatmapEvent.Shots]: _(
      msg({
        context: 'Heatmap event',
        message: 'Shots',
      }),
    ),
    [HeatmapEvent.HeGrenade]: _(
      msg({
        context: 'Heatmap event',
        message: 'HE',
      }),
    ),
    [HeatmapEvent.Flashbang]: _(
      msg({
        context: 'Heatmap event',
        message: 'Flashbang',
      }),
    ),
    [HeatmapEvent.Smoke]: _(
      msg({
        context: 'Heatmap event',
        message: 'Smoke',
      }),
    ),
    [HeatmapEvent.Molotov]: _(
      msg({
        context: 'Heatmap event',
        message: 'Molotov',
      }),
    ),
    [HeatmapEvent.Decoy]: _(
      msg({
        context: 'Heatmap event',
        message: 'Decoy',
      }),
    ),
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
