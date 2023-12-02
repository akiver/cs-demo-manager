import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { HlaeConfigFolderPath } from './hlae/hlae-config-folder-path';
import { FfmpegLocation } from './ffmpeg/ffmpeg-location';
import { HlaeLocation } from './hlae/hlae-location';

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
            </div>
          </div>
        )}
        <div>
          <p className="text-subtitle mb-8">FFmpeg</p>
          <FfmpegLocation />
        </div>
      </div>
    </SettingsView>
  );
}
