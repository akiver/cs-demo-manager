import React from 'react';
import { Trans } from '@lingui/react/macro';
import { DemoField } from './demo-field';
import { useSecondsToFormattedMinutes } from 'csdm/ui/hooks/use-seconds-to-formatted-minutes';

type Props = {
  duration: number;
};

export function DemoDuration({ duration }: Props) {
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();

  return <DemoField label={<Trans>Duration:</Trans>} value={secondsToFormattedMinutes(duration)} />;
}
