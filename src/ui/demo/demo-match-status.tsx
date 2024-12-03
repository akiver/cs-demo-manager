import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SeeMatchButton } from './see-match-button';
import { SupportedDemoSourcesPerGame } from 'csdm/ui/shared/supported-demo-sources';
import { ChangeDemosSourceDialog } from 'csdm/ui/components/dialogs/change-demos-source-dialog';
import { Button } from 'csdm/ui/components/buttons/button';
import { useIsDemoInDatabase } from './use-is-demo-in-database';
import { AnalyzeButton } from 'csdm/ui/components/buttons/analyze-button';
import type { Demo } from 'csdm/common/types/demo';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useIsDemoAnalysisInProgress } from 'csdm/ui/analyses/use-is-demo-analysis-in-progress';

type Props = {
  demo: Demo;
};

export function DemoMatchStatus({ demo }: Props) {
  const { showDialog } = useDialog();
  const isDemoInDatabase = useIsDemoInDatabase();
  const isDemoAnalysisInProgress = useIsDemoAnalysisInProgress();

  if (!SupportedDemoSourcesPerGame[demo.game].includes(demo.source)) {
    return (
      <div className="flex flex-col">
        <p>
          <Trans>The source of this demo is not supported.</Trans>
        </p>
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => {
              showDialog(<ChangeDemosSourceDialog checksums={[demo.checksum]} initialSource={demo.source} />);
            }}
          >
            <Trans context="Button">Change source</Trans>
          </Button>
        </div>
      </div>
    );
  }

  const renderDemoMatchStatus = () => {
    if (isDemoAnalysisInProgress(demo.checksum)) {
      return (
        <p>
          <Trans>Demo analysis in progress.</Trans>
        </p>
      );
    }

    if (isDemoInDatabase(demo.checksum)) {
      return (
        <div className="flex flex-col">
          <p>
            <Trans>This demo has been analyzed.</Trans>
          </p>
          <div className="flex justify-center mt-8">
            <SeeMatchButton />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <p>
          <Trans>This demo has not been analyzed yet.</Trans>
        </p>
        <div className="flex justify-center mt-8">
          <AnalyzeButton demos={[demo]} />
        </div>
      </div>
    );
  };

  return <div className="flex flex-col h-full items-center justify-center">{renderDemoMatchStatus()}</div>;
}
