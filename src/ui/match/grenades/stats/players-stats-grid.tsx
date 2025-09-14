import React from 'react';
import clsx from 'clsx';
import { Avatar } from 'csdm/ui/components/avatar';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import { FlashbangCells } from 'csdm/ui/match/grenades/stats/cells/flashbang-cells';
import { FireCells } from 'csdm/ui/match/grenades/stats/cells/fire-cells';
import { HeGrenadeCells } from 'csdm/ui/match/grenades/stats/cells/he-grenade-cells';
import { SmokeCells } from 'csdm/ui/match/grenades/stats/cells/smoke-cells';
import { GrenadeOption } from 'csdm/ui/match/grenades/stats/grenade-option';
import { Tooltip } from 'csdm/ui/components/tooltip';

function renderCellsForGrenade(grenade: GrenadeOption, playerSteamId: string) {
  switch (grenade) {
    case GrenadeOption.Flashbang:
      return <FlashbangCells playerSteamId={playerSteamId} />;
    case GrenadeOption.Fire:
      return <FireCells playerSteamId={playerSteamId} />;
    case GrenadeOption.HE:
      return <HeGrenadeCells playerSteamId={playerSteamId} />;
    case GrenadeOption.Smoke:
      return <SmokeCells playerSteamId={playerSteamId} />;
    default:
      logger.warn(`Unknown grenade ${grenade}`);
  }
}

type Props = {
  players: MatchPlayer[];
  teamName: string;
  grenade: GrenadeOption;
};

export function PlayersStatsGrid({ players, teamName, grenade }: Props) {
  return (
    <>
      <p className="text-body-strong">{teamName}</p>
      <div
        className="row-start-2 mt-8 grid"
        style={{
          gridTemplateColumns: `repeat(${players.length}, 72px)`,
        }}
      >
        {players.map((player, index) => {
          const isLastPlayer = index === players.length - 1;
          return (
            <div key={player.steamId}>
              <Tooltip content={player.name} placement="top">
                <div className="mb-8">
                  <Avatar avatarUrl={player.avatar} size={60} playerColor={player.color} />
                  <p className="selectable truncate" title={player.name}>
                    {player.name}
                  </p>
                </div>
              </Tooltip>
              <div
                className={clsx({
                  'border-r border-r-gray-300': !isLastPlayer,
                })}
              >
                {renderCellsForGrenade(grenade, player.steamId)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
