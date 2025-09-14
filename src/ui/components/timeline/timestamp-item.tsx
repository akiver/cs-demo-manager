import React from 'react';
import { scaleStyle } from './use-timeline';
import { Trans } from '@lingui/react/macro';

type Props = {
  minutes: number;
};

export function TimestampItem({ minutes }: Props) {
  return (
    <div className="flex origin-left items-center" style={scaleStyle}>
      <span className="ml-4">
        <Trans context="Minutes timestamp in timelines">{minutes} min</Trans>
      </span>
    </div>
  );
}
