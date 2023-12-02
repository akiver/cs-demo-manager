import React from 'react';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';

export function ConcatenateSequencesCheckbox() {
  const { settings, updateSettings } = useVideoSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      concatenateSequences: event.target.checked,
    });
  };

  if (settings.encoderSoftware !== EncoderSoftware.FFmpeg || settings.generateOnlyRawFiles) {
    return null;
  }

  return (
    <Checkbox
      id="concatenate-sequences"
      label="Concatenate sequences into 1 video"
      onChange={onChange}
      isChecked={settings.concatenateSequences}
    />
  );
}
