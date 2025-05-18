import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { PanelStatRow } from 'csdm/ui/components/panel';
import { Section } from 'csdm/ui/components/section';
import { roundNumber } from 'csdm/common/math/round-number';
import { WinRate } from 'csdm/ui/components/panels/win-rate';
import type { Clutch } from 'csdm/common/types/clutch';

type ClutchProps = {
  title: ReactNode;
  opponentCount: number;
  allClutches: Clutch[];
};

function ClutchPanel({ allClutches, title, opponentCount }: ClutchProps) {
  const clutches =
    opponentCount > 0 ? allClutches.filter((clutch) => clutch.opponentCount === opponentCount) : allClutches;
  const wonCount = clutches.filter((clutch) => clutch.won).length;
  const lostClutches = clutches.filter((clutch) => !clutch.won);
  const lostCount = lostClutches.length;
  const winRate = roundNumber((wonCount / clutches.length) * 100, 1);
  const saveClutchCount = lostClutches.filter((clutch) => clutch.hasClutcherSurvived).length;
  const saveRate = roundNumber((saveClutchCount / lostCount) * 100, 1);
  const killCount = clutches.reduce((previousClutch, clutch) => previousClutch + clutch.clutcherKillCount, 0);
  const averageKill = roundNumber(killCount / clutches.length, 1);

  return (
    <div className="flex flex-col w-[192px] border border-gray-300 bg-gray-100 p-8 rounded">
      <p className="text-body-strong">{title}</p>
      <div className="flex flex-col mt-12">
        <PanelStatRow title={<Trans>Total</Trans>} value={clutches.length} />
        <PanelStatRow title={<Trans>Won</Trans>} value={wonCount} />
        <PanelStatRow title={<Trans>Lost</Trans>} value={lostCount} />
        <PanelStatRow title={<Trans>Avg kill</Trans>} value={averageKill} />
        <div className="flex flex-col gap-y-px">
          <WinRate value={winRate} barClassName="bg-green-700" />
          <WinRate title={<Trans>Save rate</Trans>} value={saveRate} barClassName="bg-orange-700" />
        </div>
      </div>
    </div>
  );
}

type Props = {
  clutches: Clutch[];
};

export function Clutches({ clutches }: Props) {
  return (
    <Section title={<Trans>Clutches</Trans>}>
      <div className="flex flex-wrap gap-12">
        <ClutchPanel opponentCount={0} title={<Trans>Overall</Trans>} allClutches={clutches} />
        <ClutchPanel opponentCount={1} title={<Trans>1v1</Trans>} allClutches={clutches} />
        <ClutchPanel opponentCount={2} title={<Trans>1v2</Trans>} allClutches={clutches} />
        <ClutchPanel opponentCount={3} title={<Trans>1v3</Trans>} allClutches={clutches} />
        <ClutchPanel opponentCount={4} title={<Trans>1v4</Trans>} allClutches={clutches} />
        <ClutchPanel opponentCount={5} title={<Trans>1v5</Trans>} allClutches={clutches} />
      </div>
    </Section>
  );
}
