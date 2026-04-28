import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { AVAILABLE_PLACEHOLDERS } from './output-file-name-utils';

function getPlaceholderDescription(placeholder: (typeof AVAILABLE_PLACEHOLDERS)[number]) {
  switch (placeholder) {
    case '{map}':
      return <Trans>Map name (e.g., de_dust2)</Trans>;
    case '{checksum}':
      return <Trans>Match checksum/ID</Trans>;
    case '{game}':
      return <Trans>Game (CS2 or CSGO)</Trans>;
    case '{date}':
      return <Trans>Current date (YYYY-MM-DD)</Trans>;
    case '{time}':
      return <Trans>Current time (HH-MM-SS)</Trans>;
    case '{encoder}':
      return <Trans>Encoder software</Trans>;
    case '{resolution}':
      return <Trans>Resolution (e.g., 1920x1080)</Trans>;
    case '{framerate}':
      return <Trans>Framerate (e.g., 30)</Trans>;
  }
}

export function OutputFileNameInput() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const fileName = event.target.value.trim();
    await updateSettings({
      outputFileName: fileName,
    });
  };

  if (
    settings.encoderSoftware !== EncoderSoftware.FFmpeg ||
    settings.recordingOutput === RecordingOutput.Images ||
    !settings.concatenateSequences
  ) {
    return null;
  }

  const tooltipContent = (
    <div className="flex flex-col gap-y-4">
      <p className="font-semibold">
        <Trans>Available placeholders:</Trans>
      </p>
      <ul className="flex flex-col gap-y-4">
        {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
          <li key={placeholder} className="flex gap-x-4">
            <code className="bg-gray-700 px-8 py-4">{placeholder}</code>
            <span>{getPlaceholderDescription(placeholder)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex items-center gap-x-8">
      <TextInput
        label={<Trans context="Input label">Output filename</Trans>}
        defaultValue={settings.outputFileName}
        onBlur={onBlur}
        placeholder="output"
      />
      <Tooltip content={tooltipContent}>
        <div className="cursor-help text-gray-600">
          <Trans>?</Trans>
        </div>
      </Tooltip>
    </div>
  );
}
