import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { PlayerFilterDropdown } from './player-filter-dropdown';
import { PlayerSteamLink } from './player-steam-link';
import { useUnsafePlayer } from './use-unsafe-player';
import { Tags } from 'csdm/ui/components/tags/tags';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { PlayersTagsDialog } from 'csdm/ui/players/players-tags-dialogs';
import type { PlayerProfile } from 'csdm/common/types/player-profile';
import { ExportPlayerAsXlsxButton } from './export-player-as-xlsx-button';

type LeftProps = {
  player: PlayerProfile;
};

function Left({ player }: LeftProps) {
  const { showDialog } = useDialog();
  const onEditTagsClick = () => {
    showDialog(<PlayersTagsDialog steamIds={[player.steamId]} defaultTagIds={player.tagIds} />);
  };

  return (
    <div className="flex items-center gap-x-8">
      <PlayerSteamLink player={player} />
      <Tags tagIds={player.tagIds} onEditClick={onEditTagsClick} />
    </div>
  );
}

export function PlayerActionBar() {
  const player = useUnsafePlayer();

  return (
    <ActionBar
      left={player && <Left player={player} />}
      right={
        <>
          <ExportPlayerAsXlsxButton />
          <PlayerFilterDropdown />
        </>
      }
    />
  );
}
