import React, { useState } from 'react';
import { Trans, Plural } from '@lingui/macro';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import type { Demo } from 'csdm/common/types/demo';
import { Checkbox } from '../inputs/checkbox';
import { useAddDemosToAnalyses } from 'csdm/ui/hooks/use-add-demos-to-analyses';
import { ExternalLink } from '../external-link';

type Props = {
  analyzableDemos: Demo[];
  demosSourceNotSupportedCount: number;
  demosAnalysesInProgressCount: number;
  demosAlreadyInDatabase: Demo[];
};

export function AnalyzeConfirmationDialog({
  analyzableDemos,
  demosAlreadyInDatabase,
  demosAnalysesInProgressCount,
  demosSourceNotSupportedCount,
}: Props) {
  const addDemosToAnalyses = useAddDemosToAnalyses();
  const [shouldReanalyzeDemos, setShouldReanalyzeDemos] = useState(false);

  const demosToAnalyze = [...analyzableDemos];
  if (shouldReanalyzeDemos) {
    demosToAnalyze.push(...demosAlreadyInDatabase);
  }
  const isConfirmButtonDisabled = demosToAnalyze.length === 0;
  const demoAlreadyInDatabaseCount = demosAlreadyInDatabase.length;

  const onConfirm = () => {
    addDemosToAnalyses(demosToAnalyze);
  };

  return (
    <ConfirmDialog title="Demo analysis" onConfirm={onConfirm} isConfirmButtonDisabled={isConfirmButtonDisabled}>
      <ul>
        {demosSourceNotSupportedCount > 0 && (
          <li>
            <p>
              <Plural
                value={demosSourceNotSupportedCount}
                one="The demo's source is not supported"
                other="# demos source are not supported"
              />
            </p>

            <p>
              <Trans>
                Please see this{' '}
                <ExternalLink href="https://cs-demo-manager.com/docs/faq/stats#the-demo-source-is-not-supported">
                  documentation
                </ExternalLink>{' '}
                for details.
              </Trans>
            </p>
          </li>
        )}
        {demosAnalysesInProgressCount > 0 && (
          <li>
            <Plural
              value={demosAnalysesInProgressCount}
              one="The demo is already in pending analyses"
              other="# demos are already in pending analyses"
            />
          </li>
        )}
        {demoAlreadyInDatabaseCount > 0 && (
          <li>
            <Plural
              value={demoAlreadyInDatabaseCount}
              one="# demo is already in the database"
              other="# demos are already in the database"
            />
          </li>
        )}
      </ul>
      {demoAlreadyInDatabaseCount > 0 && (
        <div className="my-4">
          <Checkbox
            id="re-analyze-demos"
            label={<Trans context="Checkbox label">Analyze demos already in database?</Trans>}
            isChecked={shouldReanalyzeDemos}
            onChange={(event) => {
              setShouldReanalyzeDemos(event.target.checked);
            }}
          />
        </div>
      )}
      <p>
        <Plural value={demosToAnalyze.length} one="# demo will be analyzed" other="# demos will be analyzed" />
      </p>
    </ConfirmDialog>
  );
}
