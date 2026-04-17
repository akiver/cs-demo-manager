import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { RecordingOutput as Output } from 'csdm/common/types/recording-output';
import { RecordingOutput } from './recording-output';

export function RecordingOutputSelect() {
  const { settings, updateSettings } = useVideoSettings();

  const options: SelectOption<Output>[] = Object.values(Output).map((output) => {
    return {
      value: output,
      label: <RecordingOutput output={output} />,
    };
  });

  return (
    <div className="mb-8 flex w-[152px] flex-col gap-y-8">
      <Select
        label={<Trans context="Select label">Output</Trans>}
        options={options}
        value={settings.recordingOutput}
        onChange={async (recordingOutput) => {
          await updateSettings({
            recordingOutput,
          });
        }}
      />
    </div>
  );
}
