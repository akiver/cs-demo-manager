import React from 'react';
import { ActionBar as CommonActionBar } from 'csdm/ui/components/action-bar';
import { Content } from 'csdm/ui/components/content';
import { SeeMatchButton } from './see-match-button';
import { PreviousDemoLink } from './previous-demo-link';
import { NextDemoLink } from './next-demo-link';
import { RevealDemoInExplorerButton } from './reveal-demo-in-explorer-button';
import { DemoInformation } from './demo-information';
import { DemoMatchStatus } from './demo-match-status';
import { WatchDemoButton } from './watch-demo-button';
import { useCurrentDemo } from './use-current-demo';
import { AnalyzeButton } from 'csdm/ui/components/buttons/analyze-button';

function ActionBar() {
  const demo = useCurrentDemo();

  return (
    <CommonActionBar
      left={
        <>
          <PreviousDemoLink />
          <SeeMatchButton />
          <WatchDemoButton />
          <AnalyzeButton demos={[demo]} />
          <RevealDemoInExplorerButton />
          <NextDemoLink />
        </>
      }
    />
  );
}

export function DemoWithoutValveMatch() {
  const demo = useCurrentDemo();

  return (
    <>
      <ActionBar />
      <Content>
        <div className="flex">
          <DemoInformation demo={demo} />
          <div className="w-full ml-4">
            <DemoMatchStatus demo={demo} />
          </div>
        </div>
      </Content>
    </>
  );
}
