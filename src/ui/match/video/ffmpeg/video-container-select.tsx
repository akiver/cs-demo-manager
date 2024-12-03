import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { VideoContainer } from 'csdm/common/types/video-container';

export function VideoContainerSelect() {
  const { settings, updateSettings } = useVideoSettings();
  const options: SelectOption<VideoContainer>[] = Object.values(VideoContainer).map((container) => {
    return {
      value: container,
      label: container,
    };
  });

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Video container</Trans>
      </InputLabel>
      <Select
        options={options}
        value={settings.ffmpegSettings.videoContainer}
        onChange={async (videoContainer) => {
          await updateSettings({
            ffmpegSettings: {
              videoContainer,
            },
          });
        }}
      />
    </div>
  );
}
