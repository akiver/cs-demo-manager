import type { ReactNode } from 'react';
import React from 'react';
import { RoundEndReason } from 'csdm/common/types/counter-strike';
import { ExplosionIcon } from 'csdm/ui/icons/explosion-icon';
import { FlagIcon } from 'csdm/ui/icons/flag-icon';
import { EliminationIcon } from 'csdm/ui/icons/elimination-icon';
import { ClockIcon } from 'csdm/ui/icons/clock-icon';
import { DefuserIcon } from 'csdm/ui/icons/weapons/defuser-icon';
import type { Round } from 'csdm/common/types/round';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';

function getRoundEndReasonIcon(roundEndReason: RoundEndReason): ReactNode {
  switch (roundEndReason) {
    case RoundEndReason.TargetBombed:
      return <ExplosionIcon />;
    case RoundEndReason.BombDefused:
      return <DefuserIcon />;
    case RoundEndReason.CtWin:
    case RoundEndReason.TerroristWin:
    case RoundEndReason.TerroristsStopped:
    case RoundEndReason.TerroristsEscaped:
      return <EliminationIcon />;
    case RoundEndReason.TargetSaved:
      return <ClockIcon />;
    case RoundEndReason.CounterTerroristsSurrender:
    case RoundEndReason.TerroristsSurrender:
      return <FlagIcon />;
    default:
      return null;
  }
}

type Props = {
  round: Round;
};

export function RoundEndReasonIcon({ round }: Props) {
  const icon = getRoundEndReasonIcon(round.endReason);

  return (
    <div
      className="w-20"
      style={{
        color: getTeamColor(round.winnerSide),
      }}
    >
      {icon}
    </div>
  );
}
