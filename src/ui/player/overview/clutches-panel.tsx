import React from 'react';
import { Panel, PanelStatRow } from 'csdm/ui/components/panel';
import { roundNumber } from 'csdm/common/math/round-number';
import { WinRate } from 'csdm/ui/components/panels/win-rate';
import { usePlayer } from '../use-player';

type ClutchProps = {
  title: string;
  opponentCount: number;
};

function Clutch({ title, opponentCount }: ClutchProps) {
  const { clutches: allClutches } = usePlayer();
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
    <div className="flex flex-col w-[192px] border border-gray-300 p-8 rounded">
      <p className="text-body-strong">{title}</p>
      <div className="flex flex-col mt-12">
        <PanelStatRow title="Total" value={clutches.length} />
        <PanelStatRow title="Won" value={wonCount} />
        <PanelStatRow title="Lost" value={lostCount} />
        <PanelStatRow title="Avg kill" value={averageKill} />
        <div className="flex flex-col gap-y-px">
          <WinRate value={winRate} barClassName="bg-green-700" />
          <WinRate title="Save rate" value={saveRate} barClassName="bg-orange-700" />
        </div>
      </div>
    </div>
  );
}

export function ClutchesPanel() {
  return (
    <Panel header="Clutches">
      <div className="flex flex-wrap gap-12">
        <Clutch opponentCount={0} title="Overall" />
        <Clutch opponentCount={1} title="1v1" />
        <Clutch opponentCount={2} title="1v2" />
        <Clutch opponentCount={3} title="1v3" />
        <Clutch opponentCount={4} title="1v4" />
        <Clutch opponentCount={5} title="1v5" />
      </div>
    </Panel>
  );
}
