import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useFormatTimeToDamage } from 'csdm/ui/hooks/use-format-time-to-damage';

type Props = {
  timeToKill: number | null;
};

export function TimeToKill({ timeToKill }: Props) {
  const formatTimeToDamage = useFormatTimeToDamage();
  if (timeToKill === null) {
    return null;
  }

  const formattedTimeToKill = formatTimeToDamage(timeToKill);

  return (
    <Tooltip content={<Trans>Time between the moment the killer saw the victim and the kill</Trans>}>
      <p className="text-caption whitespace-nowrap text-gray-700">
        <Trans context="Time to kill">TTK {formattedTimeToKill}</Trans>
      </p>
    </Tooltip>
  );
}
