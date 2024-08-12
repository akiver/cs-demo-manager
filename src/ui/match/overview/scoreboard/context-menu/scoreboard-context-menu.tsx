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

type Props = {
  steamId: string;
  name: string;
  demoPath: string;
};

export function ScoreboardContextMenu({ steamId, name, demoPath }: Props) {
  const match = useCurrentMatch();
  const { showDialog } = useDialog();
  const navigateToMatchPlayer = useNavigateToMatchPlayer();
  const canStartCs = isCounterStrikeStartable(match.game);

  const onUpdateNameClick = () => {
    showDialog(<UpdatePlayerNameDialog steamId={steamId} name={name} />);
  };

  return (
    <ContextMenu>
      <DetailsItem
        onClick={() => {
          navigateToMatchPlayer(match.checksum, steamId);
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
      {isVideoGenerationAvailable(match.game) && <GeneratePlayerVideoItem steamId={steamId} />}
      <PinPlayerItem steamId={steamId} />
      <IgnoreSteamAccountBanItem steamId={steamId} />
      <UpdateNameItem onClick={onUpdateNameClick} />
    </ContextMenu>
  );
}
