import React from 'react';
import { Trans } from '@lingui/react/macro';
import { MapIcon } from 'csdm/ui/icons/map-icon';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { OpacityInput } from 'csdm/ui/components/inputs/opacity-input';
import { Popover, PopoverContent, PopoverTrigger } from 'csdm/ui/components/popover/popover';
import { RangeInput } from 'csdm/ui/components/inputs/range-input';
import { ResetButton } from 'csdm/ui/components/buttons/reset-button';

type Props = {
  radarSize: number;
};

function LowerRadarPopover({ radarSize }: Props) {
  const {
    lowerRadarOffsetX,
    setLowerRadarOffsetX,
    lowerRadarOffsetY,
    setLowerRadarOffsetY,
    lowerRadarOpacity,
    setLowerRadarOpacity,
  } = useViewerContext();

  return (
    <div className="flex flex-col gap-y-8 p-8 bg-gray-100 rounded-8">
      <p className="text-body-strong">
        <Trans>Lower radar configuration</Trans>
      </p>

      <RangeInput
        label={<Trans context="Input label">X</Trans>}
        value={lowerRadarOffsetX}
        onChange={setLowerRadarOffsetX}
        min={-radarSize}
        max={radarSize}
      />

      <RangeInput
        label={<Trans context="Input label">Y</Trans>}
        value={lowerRadarOffsetY}
        onChange={setLowerRadarOffsetY}
        min={-radarSize * 2}
        max={0}
      />

      <OpacityInput value={lowerRadarOpacity} onChange={setLowerRadarOpacity} />

      <div>
        <ResetButton
          onClick={() => {
            setLowerRadarOffsetX(0);
            setLowerRadarOffsetY(0);
            setLowerRadarOpacity(1);
          }}
        />
      </div>
    </div>
  );
}

export function LowerRadarButton() {
  const { map } = useViewerContext();

  if (map.lowerRadarFilePath === undefined) {
    return null;
  }

  return (
    <Popover openOnHover={true}>
      <PopoverTrigger asChild={true}>
        <PlaybackBarButton>
          <MapIcon />
        </PlaybackBarButton>
      </PopoverTrigger>

      <PopoverContent>
        <LowerRadarPopover radarSize={map.radarSize} />
      </PopoverContent>
    </Popover>
  );
}
