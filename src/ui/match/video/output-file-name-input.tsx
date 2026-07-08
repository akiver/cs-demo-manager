import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { QuestionIcon } from 'csdm/ui/icons/question-icon';
import { VideoFilenamePlaceholder } from 'csdm/common/types/video-filename-placeholders';
import { assertNever } from 'csdm/common/assert-never';

function getPlaceholderDescription(placeholder: VideoFilenamePlaceholder) {
  switch (placeholder) {
    case VideoFilenamePlaceholder.Map:
      return <Trans>Map name (e.g., de_dust2)</Trans>;
    case VideoFilenamePlaceholder.Checksum:
      return <Trans>Match checksum/ID</Trans>;
    case VideoFilenamePlaceholder.Game:
      return <Trans>Game (CS2 or CSGO)</Trans>;
    case VideoFilenamePlaceholder.Date:
      return <Trans>Current date (YYYY-MM-DD)</Trans>;
    case VideoFilenamePlaceholder.Time:
      return <Trans>Current time (HH-MM-SS)</Trans>;
    case VideoFilenamePlaceholder.Encoder:
      return <Trans>Encoder software</Trans>;
    case VideoFilenamePlaceholder.Resolution:
      return <Trans>Resolution (e.g., 1920x1080)</Trans>;
    case VideoFilenamePlaceholder.Framerate:
      return <Trans>Framerate (e.g., 30)</Trans>;
    default:
      return assertNever(placeholder, `Unknown placeholder: ${placeholder as string}`);
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

  return (
    <div className="flex items-center gap-x-8">
      <TextInput
        label={
          <div className="flex items-center gap-x-8">
            <p>
              <Trans context="Input label">Output filename</Trans>
            </p>
            <Tooltip
              keepOpenOnHover={true}
              renderInPortal={true}
              content={
                <div className="flex flex-col gap-y-8">
                  <p className="text-body-strong">
                    <Trans>Available placeholders</Trans>
                  </p>
                  <ul className="flex flex-col gap-y-8">
                    {Object.values(VideoFilenamePlaceholder).map((placeholder) => {
                      return (
                        <li key={placeholder} className="flex gap-x-8">
                          <p className="selectable bg-black text-white">{placeholder}</p>
                          <span>{getPlaceholderDescription(placeholder)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              }
            >
              <QuestionIcon className="size-12" />
            </Tooltip>
          </div>
        }
        defaultValue={settings.outputFileName}
        onBlur={onBlur}
        placeholder="output"
      />
    </div>
  );
}
