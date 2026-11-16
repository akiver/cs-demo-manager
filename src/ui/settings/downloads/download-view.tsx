import React from 'react';
import { DownloadFolderPath } from './download-folder-path';
import { FaceitSettings } from './faceit-settings';
import { ValveSettings } from './valve-settings';
import { FiveEPlaySettings } from './5eplay-settings';
import { RenownSettings } from './renown-settings';
import { AnalyzeDownloadedDemos } from './analyze-downloaded-demos';

export function DownloadSettings() {
  return (
    <div className="flex flex-col gap-y-12">
      <div>
        <DownloadFolderPath />
        <AnalyzeDownloadedDemos />
      </div>
      <ValveSettings />
      <FaceitSettings />
      <RenownSettings />
      <FiveEPlaySettings />
    </div>
  );
}
