import React from 'react';
import type { ValvePlayerRound } from 'csdm/common/types/valve-match';
import { EliminationIcon } from 'csdm/ui/icons/elimination-icon';
import { StarIcon } from 'csdm/ui/icons/star-icon';
import { EliminationHeadshotIcon } from 'csdm/ui/icons/elimination-headshot-icon';
import { hexToRgba } from 'csdm/ui/shared/colors';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { RoundContextMenu } from './round-context-menu';
import { Game } from 'csdm/common/types/counter-strike';

function DeathElimination({ deathCount }: { deathCount: number }) {
  return <EliminationIcon height={32} className="text-red-600" opacity={deathCount === 0 ? 0 : 1} />;
}

type Props = {
  round: ValvePlayerRound;
  demoPath: string | undefined;
  game: Game;
};

export function PerformanceTimeLineBar({ round, demoPath, game }: Props) {
  const regularKillCount = round.killCount - round.headshotCount;
  const headshotKillCount = round.headshotCount;
  const hiddenCount = 5 - regularKillCount - headshotKillCount;
  const color = getTeamColor(round.teamNumber);
  const { showContextMenu } = useContextMenu();
  // TODO CS2 Allow it when the playdemo command in CS2 supports the startround argument
  const canOpenContextMenu = demoPath !== undefined && game === Game.CSGO;

  const showRoundContextMenu = (event: React.MouseEvent) => {
    if (!canOpenContextMenu) {
      return;
    }
    event.stopPropagation();
    showContextMenu(event.nativeEvent, <RoundContextMenu round={round} demoPath={demoPath} />);
  };

  return (
    <div
      className={`flex flex-col ${canOpenContextMenu ? 'from-gray-300 hover:bg-linear-to-t' : ''}`}
      onContextMenu={showRoundContextMenu}
      onClick={showRoundContextMenu}
    >
      <div
        className="flex flex-col flex-1 relative pb-12"
        style={{
          color,
          background: round.hasWon
            ? `linear-gradient(to top, ${hexToRgba(color, 0.8)} 0%, ${hexToRgba(color, 0.2)} 2%, ${hexToRgba(
                color,
                0.03,
              )} 60%, ${hexToRgba(color, 0)} 100%)`
            : 'none',
        }}
      >
        {Array.from({ length: hiddenCount })
          .fill(0)
          .map((value, index) => {
            return <EliminationIcon key={`hidden-${round.number}-${index}`} opacity={0} height={32} />;
          })}
        {regularKillCount > 0 &&
          Array.from({ length: regularKillCount })
            .fill(0)
            .map((value, index) => {
              return <EliminationIcon key={`elimination-${round.number}-${index}`} height={32} color={color} />;
            })}
        {headshotKillCount > 0 &&
          Array.from({ length: headshotKillCount })
            .fill(0)
            .map((value, index) => {
              return <EliminationHeadshotIcon key={`hs-${round.number}-${index}`} height={32} color={color} />;
            })}
        {round.mvpCount > 0 && (
          <div className="absolute -bottom-12">
            <StarIcon height={32} color={color} />
          </div>
        )}
      </div>
      <div
        className={`pt-12 opacity-25 ${round.deathCount === 0 ? '' : 'bg-linear-to-b from-red-600 via-transparent'}`}
      >
        <DeathElimination deathCount={round.deathCount} />
      </div>
      <p className="self-center">{round.number}</p>
    </div>
  );
}
