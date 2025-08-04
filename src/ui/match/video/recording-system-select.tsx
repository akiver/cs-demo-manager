import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { RecordingSystem } from 'csdm/common/types/recording-system';

export function RecordingSystemSelect() {
  const { settings, updateSettings } = useVideoSettings();

  const options: SelectOption<RecordingSystem>[] = [
    {
      value: RecordingSystem.HLAE,
      label: 'HLAE',
    },
    {
      value: RecordingSystem.CounterStrike,
      label: 'Counter-Strike',
    },
  ];

  return (
    <div className="flex flex-col gap-y-8 w-[152px] mb-8">
      <InputLabel>
        <Trans context="Select label">Recording system</Trans>
      </InputLabel>
      <Select
        options={options}
        value={settings.recordingSystem}
        onChange={async (recordingSystem) => {
          await updateSettings({
            recordingSystem,
          });
        }}
      />
    </div>
  );
}
