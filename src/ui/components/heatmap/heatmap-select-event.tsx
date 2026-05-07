import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { Tooltip } from 'csdm/ui/components/tooltip';

type Props = {
  event: HeatmapEvent;
  onChange: (event: HeatmapEvent) => void;
  disabledEvents?: HeatmapEvent[];
};

export function HeatmapSelectEvent({ event, onChange, disabledEvents = [] }: Props) {
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
    [HeatmapEvent.Positions]: t({
      context: 'Heatmap event',
      message: 'Positions',
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

  const options: SelectOption<HeatmapEvent>[] = Object.values(HeatmapEvent)
    .filter((event) => !disabledEvents.includes(event))
    .map((event) => {
      return {
        label: eventMessage[event],
        value: event,
      };
    });

  const disabledTooltipContent = t({
    context: 'Heatmap event tooltip',
    message: 'Available in match heatmaps only',
  });

  return (
    <div className="flex flex-col gap-y-8">
      <Select onChange={onChange} value={event} options={options} label={<Trans context="Input label">Event</Trans>} />
      {disabledEvents.length > 0 && (
        <Tooltip content={disabledTooltipContent}>
          <p className="text-caption text-gray-600">
            <Trans context="Heatmap event note">Some events are only available in match heatmaps.</Trans>
          </p>
        </Tooltip>
      )}
    </div>
  );
}
