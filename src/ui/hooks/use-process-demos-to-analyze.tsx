import React from 'react';
import { useIsDemoAnalysisInProgress } from 'csdm/ui/analyses/use-is-demo-analysis-in-progress';
import { useMatchChecksums } from 'csdm/ui/cache/use-match-checksums';
import { useAddDemosToAnalyses } from 'csdm/ui/hooks/use-add-demos-to-analyses';
import { SupportedDemoSourcesPerGame } from 'csdm/ui/shared/supported-demo-sources';
import type { Demo } from 'csdm/common/types/demo';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { AnalyzeConfirmationDialog } from 'csdm/ui/components/dialogs/analyze-demos-dialog';
import { DemoType, Game } from 'csdm/common/types/counter-strike';

export function useProcessDemosToAnalyze() {
  const isDemoAnalysisInProgress = useIsDemoAnalysisInProgress();
  const addDemosToAnalyses = useAddDemosToAnalyses();
  const matchChecksums = useMatchChecksums();
  const { showDialog } = useDialog();

  return (demos: Demo[]) => {
    const analyzableDemos: Demo[] = [];
    let demosSourceNotSupportedCount = 0;
    let demosAnalysesInProgressCount = 0;
    const demosAlreadyInDatabase: Demo[] = [];
    for (const demo of demos) {
      if (!SupportedDemoSourcesPerGame[demo.game].includes(demo.source)) {
        demosSourceNotSupportedCount++;
        continue;
      }
      if (demo.type === DemoType.POV && demo.game !== Game.CSGO) {
        demosSourceNotSupportedCount++;
        continue;
      }
      if (isDemoAnalysisInProgress(demo.checksum)) {
        demosAnalysesInProgressCount++;
        continue;
      }
      if (matchChecksums.includes(demo.checksum)) {
        demosAlreadyInDatabase.push(demo);
        continue;
      }

      analyzableDemos.push(demo);
    }

    const isSelectionAnalyzable =
      demosAlreadyInDatabase.length === 0 && demosAnalysesInProgressCount === 0 && demosSourceNotSupportedCount === 0;
    if (isSelectionAnalyzable) {
      addDemosToAnalyses(analyzableDemos);
    } else {
      showDialog(
        <AnalyzeConfirmationDialog
          analyzableDemos={analyzableDemos}
          demosAlreadyInDatabase={demosAlreadyInDatabase}
          demosAnalysesInProgressCount={demosAnalysesInProgressCount}
          demosSourceNotSupportedCount={demosSourceNotSupportedCount}
        />,
      );
    }
  };
}
