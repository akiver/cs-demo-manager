import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
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
    <div className="mb-8 flex w-[152px] flex-col gap-y-8">
      <Select
        label={<Trans context="Select label">Recording system</Trans>}
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
