import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { HlaeConfigFolderPath } from './hlae/hlae-config-folder-path';
import { FfmpegLocation } from './ffmpeg/ffmpeg-location';
import { HlaeLocation } from './hlae/hlae-location';
import { DefaultVideoRecordingSettings } from './recording/default-video-recording-settings';
import { HlaeParameters } from 'csdm/ui/match/video/hlae/hlae-parameters';

export function VideoSettings() {
  return (
    <SettingsView>
      <div className="flex flex-col gap-y-12">
        {window.csdm.isWindows && (
          <div>
            <p className="text-subtitle mb-8">HLAE</p>
            <div className="flex flex-col gap-y-8">
              <HlaeLocation />
              <HlaeConfigFolderPath />
              <HlaeParameters />
            </div>
          </div>
        )}
        <div>
          <p className="text-subtitle mb-8">FFmpeg</p>
          <FfmpegLocation />
        </div>
        <DefaultVideoRecordingSettings />
      </div>
    </SettingsView>
  );
}
