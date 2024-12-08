import React from 'react';
import { Trans } from '@lingui/react/macro';

type Props = {
  tick: number;
};

export function Tick({ tick }: Props) {
  return (
    <p>
      <Trans>
        Tick <strong>{tick}</strong>
      </Trans>
    </p>
  );
}
