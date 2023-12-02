import React from 'react';
import { AnalyzeSettings } from './analyze/analyze-settings';
import { DatabaseSettings } from './database/database-settings';
import { DownloadSettings } from './downloads/download-view';
import { FoldersSettings } from './folders/folders-settings';
import { VideoSettings } from './video/video-settings';
import { MapsSettings } from './maps/maps-settings';
import { SettingsCategory } from './settings-category';
import { IntegrationsSettings } from './integrations/integrations-settings';
import { UiSettings } from './ui/ui-settings';
import { useSettingsOverlay } from './use-settings-overlay';
import { PlaybackSettings } from './playback/playback-settings';
import { TagsSettings } from './tags/tags-settings';
import { BanSettings } from './bans/ban-settings';
import { assertNever } from 'csdm/common/assert-never';
import { About } from './about/about';

export function Settings() {
  const { category } = useSettingsOverlay();

  switch (category) {
    case SettingsCategory.Folders:
      return <FoldersSettings />;
    case SettingsCategory.Database:
      return <DatabaseSettings />;
    case SettingsCategory.UI:
      return <UiSettings />;
    case SettingsCategory.Analyze:
      return <AnalyzeSettings />;
    case SettingsCategory.Download:
      return <DownloadSettings />;
    case SettingsCategory.Playback:
      return <PlaybackSettings />;
    case SettingsCategory.Video:
      return <VideoSettings />;
    case SettingsCategory.Maps:
      return <MapsSettings />;
    case SettingsCategory.Tags:
      return <TagsSettings />;
    case SettingsCategory.Ban:
      return <BanSettings />;
    case SettingsCategory.Integrations:
      return <IntegrationsSettings />;
    case SettingsCategory.About:
      return <About />;
    default:
      return assertNever(category, `Unknown settings category: ${category}`);
  }
}
