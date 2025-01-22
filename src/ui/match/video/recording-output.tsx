import { Trans } from '@lingui/react/macro';
import { assertNever } from 'csdm/common/assert-never';
import { RecordingOutput as Output } from 'csdm/common/types/recording-output';
import React from 'react';

type Props = {
  output: Output;
};

export function RecordingOutput({ output }: Props) {
  switch (output) {
    case Output.Video:
      return <Trans>Video</Trans>;
    case Output.Images:
      return <Trans>Images</Trans>;
    case Output.ImagesAndVideo:
      return <Trans>Images + video</Trans>;
    default:
      return assertNever(output, `Unknown recording output: ${output}`);
  }
}
