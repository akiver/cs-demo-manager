import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
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
    <div className="flex flex-col gap-y-8 w-[152px] mb-8">
      <InputLabel>
        <Trans context="Select label">Output</Trans>
      </InputLabel>
      <Select
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
