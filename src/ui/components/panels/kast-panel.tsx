import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { roundNumber } from 'csdm/common/math/round-number';

type Props = {
  kast: number;
};

export function KastPanel({ kast }: Props) {
  return (
    <Panel
      fitHeight={true}
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">KAST</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{`${roundNumber(kast, 1)}%`}</PanelValue>
        </>
      }
    />
  );
}
