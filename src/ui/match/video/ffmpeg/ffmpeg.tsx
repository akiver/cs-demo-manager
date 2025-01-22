import React from 'react';
import { FfmpegAudioBitrateSelect } from 'csdm/ui/match/video/ffmpeg/ffmpeg-audio-bitrate-select';
import { ConstantRateFactorInput } from 'csdm/ui/match/video/ffmpeg/constant-rate-factor-input';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { Software } from 'csdm/ui/match/video/software';
import { FfmpegInstallButton } from 'csdm/ui/match/video/ffmpeg/ffmpeg-install-button';
import { FfmpegUpdateButton } from 'csdm/ui/match/video/ffmpeg/ffmpeg-update-button';
import { FfmpegBrowseButton } from 'csdm/ui/match/video/ffmpeg/ffmpeg-browse-button';
import { useInstalledFfmpegVersion } from 'csdm/ui/match/video/ffmpeg/use-installed-ffmpeg-version';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { VideoCodecInput } from './video-codec-input';
import { AudioCodecInput } from './audio-codec-input';
import { FfmpegInputParametersInput } from './ffmpeg-input-parameters-input';
import { FfmpegOutputParametersInput } from './ffmpeg-output-parameters-input';
import { VideoContainerSelect } from './video-container-select';
import { RecordingOutput } from 'csdm/common/types/recording-output';

export function Ffmpeg() {
  const installedFfmpegVersion = useInstalledFfmpegVersion();
  const { settings } = useVideoSettings();

  if (settings.encoderSoftware !== EncoderSoftware.FFmpeg || settings.recordingOutput === RecordingOutput.Images) {
    return null;
  }

  return (
    <div className="flex flex-col border border-gray-400 p-8 rounded gap-y-8">
      <Software name="FFmpeg" websiteLink="https://ffmpeg.org/documentation.html" version={installedFfmpegVersion}>
        <FfmpegInstallButton />
        <FfmpegUpdateButton />
        <FfmpegBrowseButton />
      </Software>
      <div className="flex flex-col gap-y-8">
        <div className="flex gap-8 flex-wrap">
          <AudioCodecInput />
          <FfmpegAudioBitrateSelect />
        </div>
        <div className="flex gap-8 flex-wrap">
          <VideoContainerSelect />
          <VideoCodecInput />
          <ConstantRateFactorInput />
        </div>
        <FfmpegInputParametersInput />
        <FfmpegOutputParametersInput />
      </div>
    </div>
  );
}
