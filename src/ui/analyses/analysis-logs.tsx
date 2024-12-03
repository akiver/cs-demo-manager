import React, { type ReactNode } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { Analysis } from 'csdm/common/types/analysis';
import { AnalysisStatus } from 'csdm/common/types/analysis-status';
import { useSelectedAnalysis } from './use-selected-analysis-demo-id';
import { assertNever } from 'csdm/common/assert-never';
import { isAnalysisErrorStatus } from './analysis-status';
import { CopyButton } from 'csdm/ui/components/buttons/copy-button';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';

function useGenerateLogs() {
  const { t } = useLingui();

  return (analysis: Analysis) => {
    const logs: string[] = [
      t({
        context: 'Analysis status',
        message: 'Pending analysis…',
      }),
    ];
    const analyzingMessage = t({
      context: 'Analysis status',
      message: 'Analyzing demo…',
    });
    const analyzeErrorMessage = t({
      context: 'Analysis status',
      message: 'An error occurred while analyzing the demo.',
    });
    const analyzeSuccessMessage = t({
      context: 'Analysis status',
      message: 'Analysis succeed.',
    });
    const insertingMessage = t({
      context: 'Analysis status',
      message: 'Inserting match…',
    });

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

          t({
            context: 'Analysis status',
            message: 'Match inserted into the database.',
          }),
        );
        break;
      case AnalysisStatus.InsertError:
        logs.push(
          analyzingMessage,
          analyzeSuccessMessage,
          insertingMessage,

          t({
            context: 'Analysis status',
            message: 'An error occurred while inserting the match into the database.',
          }),
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
    let message: ReactNode;

    if (isErrorCode(selectedAnalysis.errorCode)) {
      const errorCodeMapping = {
        [ErrorCode.InsertMatchDuplicatedChecksum]: 'INSERT_MATCH_DUPLICATED_CHECKSUM',
        [ErrorCode.InsertRoundsError]: 'INSERT_ROUNDS_ERROR',
      } as Record<ErrorCode, string>;

      const errorCode = errorCodeMapping[selectedAnalysis.errorCode] ?? 'UNKNOWN';
      message = (
        <div>
          <p>
            <Trans>
              The analysis failed with the error code: <strong className="selectable">{errorCode}</strong>
            </Trans>
          </p>
          <p>
            <Trans>
              Please read the error codes{' '}
              <ExternalLink href="https://cs-demo-manager.com/docs/guides/demos-analysis#analysis-errors">
                documentation
              </ExternalLink>{' '}
              to understand the code signification and what you can do.
            </Trans>
          </p>
          <p>
            <Trans>
              Please read and follow the instructions on{' '}
              <ExternalLink href="https://github.com/akiver/cs-demo-manager/issues/new?assignees=&labels=&projects=&template=bug_report.yml">
                GitHub
              </ExternalLink>{' '}
              to report the issue <strong>only if the documentation says you should for this error code</strong>.
            </Trans>
          </p>
        </div>
      );
    } else {
      message = (
        <p>
          <Trans>
            Please read and follow the instructions on{' '}
            <ExternalLink href="https://github.com/akiver/cs-demo-manager/issues/new?assignees=&labels=&projects=&template=bug_report.yml">
              GitHub
            </ExternalLink>{' '}
            to report the issue.
          </Trans>
        </p>
      );
    }

    return (
      <div className="flex items-center gap-x-8 py-8">
        <ExclamationTriangleIcon className="size-24 text-red-700" />
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
