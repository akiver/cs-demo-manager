import React from 'react';
import { AnalysesLink } from './analyses-link';
import { SettingsButton } from './settings-button';
import { DownloadsLink } from './downloads-link';
import { PinnedPlayerLink } from './pinned-player-link';
import { PlayersLink } from './players-link';
import { BansLink } from './bans-link';
import { MatchesLink } from './matches-link';
import { DemosLink } from './demos-link';
import { SearchLink } from './search-link';
import { TeamsLink } from './teams-link';
import { VideoQueueLink } from './video-queue-link';

export function LeftBar() {
  return (
    <div className="flex flex-col items-center overflow-y-auto h-full w-[60px] bg-gray-50 border-r border-r-gray-300 no-scrollbar">
      <PinnedPlayerLink />
      <div className="flex w-full my-8 px-12">
        <div className="h-px w-full bg-gray-600" />
      </div>
      <MatchesLink />
      <DemosLink />
      <PlayersLink />
      <TeamsLink />
      <DownloadsLink />
      <BansLink />
      <SearchLink />
      <AnalysesLink />
      <VideoQueueLink />
      <SettingsButton />
    </div>
  );
}
