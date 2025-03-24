import React from 'react';
import { useNavigate } from 'react-router';
import { Trans } from '@lingui/react/macro';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import { ShieldIcon } from 'csdm/ui/icons/shield-icon';
import { buildPlayerPath } from 'csdm/ui/routes-paths';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { Avatar } from 'csdm/ui/components/avatar';
import { Button } from 'csdm/ui/components/buttons/button';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { buildPlayerSteamProfileUrl } from 'csdm/ui/shared/build-player-steam-profile-url';
import { CopySteamIdButton } from 'csdm/ui/components/buttons/copy-steamid-button';
import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import { PremierRank } from 'csdm/ui/components/premier-rank';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { PlayersTagsDialog } from 'csdm/ui/players/players-tags-dialogs';
import { Tags } from 'csdm/ui/components/tags/tags';

type Props = {
  player: MatchPlayer;
};

export function PlayerActionBar({ player }: Props) {
  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const onEditTagsClick = () => {
    showDialog(<PlayersTagsDialog steamIds={[player.steamId]} defaultTagIds={player.tagIds} />);
  };

  return (
    <ActionBar
      left={
        <div className="flex items-center gap-x-8 w-max">
          <a
            href={buildPlayerSteamProfileUrl(player.steamId)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-x-4"
          >
            <Avatar avatarUrl={player.avatar} playerName={player.name} size={30} />
            <p className="text-body-strong">{player.name}</p>
          </a>
          <div className="w-[64px]">
            {player.rank > CompetitiveRank.GlobalElite ? (
              <PremierRank rank={player.rank} />
            ) : (
              <img src={window.csdm.getRankImageSrc(player.rank)} />
            )}
          </div>

          <p>{player.teamName}</p>
          {player.lastBanDate && (
            <Tooltip content={<Trans context="Tooltip">Banned player</Trans>}>
              <ShieldIcon width={20} height={20} className="text-red-600" />
            </Tooltip>
          )}
          <Tags tagIds={player.tagIds} onEditClick={onEditTagsClick} />
        </div>
      }
      right={
        <>
          <CopySteamIdButton steamId={player.steamId} />
          <Button
            onClick={() => {
              navigate(buildPlayerPath(player.steamId));
            }}
          >
            <Trans context="Button">See global stats</Trans>
          </Button>
        </>
      }
    />
  );
}
