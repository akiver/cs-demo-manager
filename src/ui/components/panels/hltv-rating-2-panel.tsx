import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { roundNumber } from 'csdm/common/math/round-number';

type Props = {
  hltvRating2: number;
};

export function HltvRating2Panel({ hltvRating2 }: Props) {
  return (
    <Panel
      fitHeight={true}
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">HLTV 2.0</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{roundNumber(hltvRating2, 2)}</PanelValue>
        </>
      }
    />
  );
}
