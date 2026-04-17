import React from 'react';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Trans } from '@lingui/react/macro';

export function FfmpegAudioBitrateSelect() {
  const { settings, updateSettings } = useVideoSettings();
  const options: SelectOption<number>[] = [128, 256, 320].map((bitrate) => {
    return {
      value: bitrate,
      label: bitrate,
    };
  });

  return (
    <div className="flex flex-col gap-y-8">
      <Select
        label={<Trans context="Input label">Audio bitrate</Trans>}
        options={options}
        value={settings.ffmpegSettings.audioBitrate}
        onChange={async (audioBitrate) => {
          await updateSettings({
            ffmpegSettings: {
              audioBitrate: Number(audioBitrate),
            },
          });
        }}
      />
    </div>
  );
}
