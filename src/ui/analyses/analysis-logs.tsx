import React, { type ReactNode } from 'react';
import { Trans, msg } from '@lingui/macro';
import type { Analysis } from 'csdm/common/types/analysis';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import { useSelectedAnalysis } from './use-selected-analysis-demo-id';
import { assertNever } from 'csdm/common/assert-never';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { isAnalysisErrorStatus } from './analysis-status';
import { CopyButton } from 'csdm/ui/components/buttons/copy-button';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

function useGenerateLogs() {
  const _ = useI18n();

  return (analysis: Analysis) => {
    const logs: string[] = [
      _(
        msg({
          context: 'Analysis status',
          message: 'Pending analysis…',
        }),
      ),
    ];
    const analyzingMessage = _(
      msg({
        context: 'Analysis status',
        message: 'Analyzing demo…',
      }),
    );
    const analyzeErrorMessage = _(
      msg({
        context: 'Analysis status',
        message: 'An error occurred while analyzing the demo.',
      }),
    );
    const analyzeSuccessMessage = _(
      msg({
        context: 'Analysis status',
        message: 'Analysis succeed.',
      }),
    );
    const insertingMessage = _(
      msg({
        context: 'Analysis status',
        message: 'Inserting match…',
      }),
    );

    switch (analysis.status) {
      case AnalysisStatus.Pending:
        return logs;
      case AnalysisStatus.Analyzing:
        logs.push(analyzingMessage);
        break;
      case AnalysisStatus.AnalyzeError:
        logs.push(analyzingMessage, analyzeErrorMessage);
        break;
      case AnalysisStatus.AnalyzeSuccess:
        logs.push(analyzingMessage, analyzeSuccessMessage);
        break;
      case AnalysisStatus.Inserting:
        logs.push(analyzingMessage, analyzeSuccessMessage, insertingMessage);
        break;
      case AnalysisStatus.InsertSuccess:
        logs.push(
          analyzingMessage,
          analyzeSuccessMessage,
          insertingMessage,
          _(
            msg({
              context: 'Analysis status',
              message: 'Match inserted into the database.',
            }),
          ),
        );
        break;
      case AnalysisStatus.InsertError:
        logs.push(
          analyzingMessage,
          analyzeSuccessMessage,
          insertingMessage,
          _(
            msg({
              context: 'Analysis status',
              message: 'An error occurred while inserting the match into the database.',
            }),
          ),
        );
        break;
      default:
        assertNever(analysis.status, `Unsupported analysis status: ${analysis.status}`);
    }

    return logs;
  };
}

export function AnalysisLogs() {
  const selectedAnalysis = useSelectedAnalysis();
  const generateLogs = useGenerateLogs();

  if (selectedAnalysis === undefined) {
    return null;
  }

  const logs = generateLogs(selectedAnalysis);

  const renderError = () => {
    const isRoundInsertionError = selectedAnalysis.output.includes('copy rounds(');

    let message: ReactNode;
    switch (true) {
      case isRoundInsertionError:
        message = (
          <div>
            <p>
              <Trans>The insertion of a round failed.</Trans>
            </p>
            <p>
              <Trans>
                Please ensure the game doesn't crash or go back to the main menu while watching the demo in-game and
                that the playback doesn't end in the middle of a round.
              </Trans>
            </p>
            <p>
              <Trans>
                If it does, it means the demo is corrupted and it's not fixable - otherwise, please open an issue on{' '}
                <ExternalLink href="https://github.com/akiver/cs-demo-manager/issues">GitHub</ExternalLink> that
                includes the logs below and a link to download the demo.
              </Trans>
            </p>
          </div>
        );
        break;
      default:
        message = (
          <p>
            <Trans>
              Please open an issue on{' '}
              <ExternalLink href="https://github.com/akiver/cs-demo-manager/issues">GitHub</ExternalLink> that includes
              the logs below and a link to download the demo.
            </Trans>
          </p>
        );
    }

    return (
      <div className="flex items-center gap-x-8 py-8">
        <ExclamationTriangleIcon className="w-24 h-24 text-red-700" />
        {message}
      </div>
    );
  };

  return (
    <div className="h-[420px] p-16 w-full border-t border-t-gray-300 mt-auto overflow-y-auto">
      <div className="flex flex-col justify-end">
        {logs.map((log, index) => {
          return <p key={`${log}${index}`}>{log}</p>;
        })}
        {isAnalysisErrorStatus(selectedAnalysis.status) && renderError()}
      </div>
      {selectedAnalysis.output && (
        <div className="flex flex-col gap-y-4 w-full mt-12">
          <div className="flex items-center gap-x-8">
            <p className="text-body-strong">
              <Trans>Logs:</Trans>
            </p>
            <CopyButton data={selectedAnalysis.output} />
          </div>
          <div className="overflow-auto bg-gray-100 max-h-[600px] rounded-8">
            <pre className="select-text p-8">{selectedAnalysis.output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
