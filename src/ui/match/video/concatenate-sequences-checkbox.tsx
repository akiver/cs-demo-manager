import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';

export function ConcatenateSequencesCheckbox() {
  const { settings, updateSettings } = useVideoSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      concatenateSequences: event.target.checked,
    });
  };

  if (settings.encoderSoftware !== EncoderSoftware.FFmpeg || settings.recordingOutput === RecordingOutput.Images) {
    return null;
  }

  return (
    <Checkbox
      label={<Trans context="Checkbox label">Concatenate sequences into 1 video</Trans>}
      onChange={onChange}
      isChecked={settings.concatenateSequences}
    />
  );
}
