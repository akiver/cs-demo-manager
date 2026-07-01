import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Message } from 'csdm/ui/components/message';
import { LoadDemosStep, type LoadDemosProgress } from 'csdm/common/types/load-demos-progress';

type Props = {
  progress: LoadDemosProgress;
};

export function LoadingDemosMessage({ progress }: Props) {
  const { step, current, total } = progress;

  if (step === LoadDemosStep.ScanningArchives && total > 0) {
    return (
      <Message
        message={
          <Trans>
            Scanning archive {current} of {total}…
          </Trans>
        }
      />
    );
  }

  if (step === LoadDemosStep.ExtractingArchives && total > 0) {
    return (
      <Message
        message={
          <Trans>
            Extracting demo {current} of {total} from archives…
          </Trans>
        }
      />
    );
  }

  if (current === 0 || total === 0) {
    return <Message message={<Trans>Loading demos…</Trans>} />;
  }

  return (
    <Message
      message={
        <Trans>
          Loading {current} of {total} demos…
        </Trans>
      }
    />
  );
}
