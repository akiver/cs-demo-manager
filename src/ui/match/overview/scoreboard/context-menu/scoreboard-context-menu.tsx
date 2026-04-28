import React from 'react';
import { SeePlayerProfileItem } from 'csdm/ui/components/context-menu/items/see-player-profile-item';
import { GeneratePlayerVideoItem } from './generate-player-video-item';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { PinPlayerItem } from 'csdm/ui/components/context-menu/items/pin-player-item';
import { ShowPlayerMatchesItem } from 'csdm/ui/components/context-menu/items/show-player-matches-item';
import { WatchPlayerItem } from 'csdm/ui/components/context-menu/items/watch-player-item';
import { CopyPlayerDataItem } from './copy-player-data-item';
import { OpenSteamProfileItem } from 'csdm/ui/components/context-menu/items/open-steam-profile-item';
import { DetailsItem } from 'csdm/ui/components/context-menu/items/details-item';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Separator } from 'csdm/ui/components/context-menu/separator';
import { isCounterStrikeStartable, isVideoGenerationAvailable } from 'csdm/ui/hooks/use-counter-strike';
import { useNavigateToMatchPlayer } from 'csdm/ui/hooks/navigation/use-navigate-to-match-player';
import { IgnoreSteamAccountBanItem } from 'csdm/ui/components/context-menu/items/ignore-steam-account-ban-item';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { UpdatePlayerNameDialog } from 'csdm/ui/dialogs/update-player-name-dialog';
import { UpdateNameItem } from 'csdm/ui/components/context-menu/items/update-name-item';
import { TagsItem } from 'csdm/ui/components/context-menu/items/tags-item';
import { PlayersTagsDialog } from 'csdm/ui/players/players-tags-dialogs';

type Props = {
  steamId: string;
  name: string;
  demoPath: string;
  tagIds: string[];
};

export function ScoreboardContextMenu({ steamId, name, demoPath, tagIds }: Props) {
  const match = useCurrentMatch();
  const { showDialog } = useDialog();
  const navigateToMatchPlayer = useNavigateToMatchPlayer();
  const canStartCs = isCounterStrikeStartable(match.game);

  const onUpdateNameClick = () => {
    showDialog(<UpdatePlayerNameDialog steamId={steamId} name={name} />);
  };

  const onTagsClick = () => {
    showDialog(<PlayersTagsDialog steamIds={[steamId]} defaultTagIds={tagIds} />);
  };

  return (
    <ContextMenu>
      <DetailsItem
        onClick={async () => {
          await navigateToMatchPlayer(match.checksum, steamId);
        }}
      />
      {canStartCs && <WatchPlayerItem demoPath={demoPath} steamId={steamId} game={match.game} />}
      <Separator />
      <SeePlayerProfileItem steamId={steamId} />
      <ShowPlayerMatchesItem steamIds={[steamId]} />
      <OpenSteamProfileItem steamIds={[steamId]} />
      <Separator />
      <CopyPlayerDataItem steamId={steamId} />
      <Separator />
      <TagsItem onClick={onTagsClick} />
      {isVideoGenerationAvailable(match.game) && <GeneratePlayerVideoItem steamId={steamId} />}
      <PinPlayerItem steamId={steamId} />
      <IgnoreSteamAccountBanItem steamId={steamId} />
      <UpdateNameItem onClick={onUpdateNameClick} />
    </ContextMenu>
  );
}
