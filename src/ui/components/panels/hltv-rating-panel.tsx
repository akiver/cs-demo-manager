import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { roundNumber } from 'csdm/common/math/round-number';

type Props = {
  hltvRating: number;
};

export function HltvRatingPanel({ hltvRating }: Props) {
  return (
    <Panel
      fitHeight={true}
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">HLTV 1.0</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{roundNumber(hltvRating, 2)}</PanelValue>
        </>
      }
    />
  );
}
