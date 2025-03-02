import React from 'react';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Trans } from '@lingui/react/macro';

export function FfmpegAudioBitrateSelect() {
  const { settings, updateSettings } = useVideoSettings();
  const options: SelectOption<number>[] = [128, 256, 320].map((bitrate) => {
    return {
      value: bitrate,
      label: bitrate.toString(),
    };
  });

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Audio bitrate</Trans>
      </InputLabel>
      <Select
        options={options}
        value={settings.ffmpegSettings.audioBitrate}
        onChange={async (audioBitrate) => {
          await updateSettings({
            ffmpegSettings: {
              audioBitrate,
            },
          });
        }}
      />
    </div>
  );
}
