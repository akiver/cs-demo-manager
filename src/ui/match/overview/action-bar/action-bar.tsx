import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { WatchMatchButton } from 'csdm/ui/match/overview/action-bar/watch-match-button';
import { WatchMatchAtTickButton } from 'csdm/ui/match/overview/action-bar/watch-match-at-tick-button';
import { RevealMatchDemoInExplorerButton } from 'csdm/ui/match/overview/action-bar/reveal-match-demo-in-explorer-button';
import { SeeDemoButton } from './see-demo-button';
import { CopyMatchShareCodeButton } from './copy-match-share-code';
import { ExportMatchAsXlsxButton } from './export-match-as-xlsx-button';
import { ExportMatchToJsonButton } from './export-match-to-json-button';
import { ScoreboardColumnsVisibility } from './scoreboard-columns-visibility';

export function MatchActionBar() {
  return (
    <ActionBar
      left={
        <>
          <WatchMatchButton />
          <WatchMatchAtTickButton />
          <RevealMatchDemoInExplorerButton />
          <SeeDemoButton />
          <CopyMatchShareCodeButton />
          <ExportMatchAsXlsxButton />
          <ExportMatchToJsonButton />
        </>
      }
      right={<ScoreboardColumnsVisibility />}
    />
  );
}
