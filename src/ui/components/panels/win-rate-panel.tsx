import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumberPercentage } from 'csdm/common/math/round-number-percentage';
import { Panel, PanelRow, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';

type CircleProps = {
  className: string;
};

function Circle({ className }: CircleProps) {
  return <div className={`size-12 rounded-full mr-4 ${className}`} />;
}

type Props = {
  matchCount: number;
  wonMatchCount: number;
  lostMatchCount: number;
  tiedMatchCount: number;
};

export function WinRatePanel({ matchCount, wonMatchCount, lostMatchCount, tiedMatchCount }: Props) {
  const winRatePercent = matchCount > 0 ? roundNumberPercentage(wonMatchCount / matchCount) : 0;

  return (
    <Panel
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">Win ratio</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{`${winRatePercent}%`}</PanelValue>
        </>
      }
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Matches played</Trans>
        </p>
        <PanelValue>{matchCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <div className="flex items-center">
          <Circle className="bg-green-700" />
          <p>
            <Trans context="Panel label">Wins</Trans>
          </p>
        </div>
        <PanelValue>{wonMatchCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <div className="flex items-center">
          <Circle className="bg-blue-700" />
          <p>
            <Trans context="Panel label">Ties</Trans>
          </p>
        </div>
        <PanelValue>{tiedMatchCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <div className="flex items-center">
          <Circle className="bg-red-700" />
          <p>
            <Trans context="Panel label">Defeats</Trans>
          </p>
        </div>
        <PanelValue>{lostMatchCount}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
