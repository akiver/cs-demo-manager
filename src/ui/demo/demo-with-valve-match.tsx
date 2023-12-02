import React from 'react';
import { CopyShareCodeButton } from 'csdm/ui/components/buttons/copy-share-code-button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import type { Demo } from 'csdm/common/types/demo';
import type { ValveMatch, ValvePlayer } from 'csdm/common/types/valve-match';
import { ValveMatchOverview } from 'csdm/ui/components/valve-match/valve-match-overview';
import { Content } from 'csdm/ui/components/content';
import { SeeMatchButton } from './see-match-button';
import { NextDemoLink } from './next-demo-link';
import { PreviousDemoLink } from './previous-demo-link';
import { DemoInformation } from './demo-information';
import { RevealDemoInExplorerButton } from './reveal-demo-in-explorer-button';
import { WatchDemoButton } from './watch-demo-button';
import { selectPlayer } from './demo-actions';
import { AnalyzeButton } from 'csdm/ui/components/buttons/analyze-button';
import { useSelectedPlayer } from './use-selected-player';

export type DemoWithValveMatchData = Demo & {
  valveMatch: ValveMatch;
};

type ActionBarProps = {
  demo: DemoWithValveMatchData;
};

function ActionBar({ demo }: ActionBarProps) {
  return (
    <CommonActionBar
      left={
        <>
          <PreviousDemoLink />
          <SeeMatchButton />
          <WatchDemoButton />
          <AnalyzeButton demos={[demo]} />
          <RevealDemoInExplorerButton />
          <CopyShareCodeButton shareCode={demo.valveMatch.sharecode} />
          <NextDemoLink />
        </>
      }
    />
  );
}

type Props = {
  demo: DemoWithValveMatchData;
};

export function DemoWithValveMatch({ demo }: Props) {
  const dispatch = useDispatch();
  const selectedPlayer = useSelectedPlayer();

  const onPlayerSelected = (player: ValvePlayer) => {
    dispatch(selectPlayer(player));
  };

  return (
    <>
      <ActionBar demo={demo} />
      <Content>
        <div className="flex">
          <DemoInformation demo={demo} />
          <ValveMatchOverview
            match={demo.valveMatch}
            demoPath={demo.filePath}
            selectedPlayer={selectedPlayer}
            onPlayerSelected={onPlayerSelected}
          />
        </div>
      </Content>
    </>
  );
}
