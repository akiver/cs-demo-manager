import React from 'react';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import { useMatches } from './use-matches';
import { useSelectedMatchId } from './use-selected-match-id';
import { useCurrentSteamId } from './use-current-steamid';
import { matchSelected } from './valve-actions';
import { ValveMatchResult } from 'csdm/common/types/valve-match';
import { MatchResult } from '../match-result';
import { MatchEntry } from '../sidebar/match-entry';

function getMatchResultForPlayerFromMatchResult(
  matchResult: ValveMatchResult,
  player: ValvePlayer | undefined,
): MatchResult {
  if (player === undefined) {
    return MatchResult.Unplayed;
  }

  if (matchResult === ValveMatchResult.Tied) {
    return MatchResult.Tied;
  }

  const { startMatchTeamNumber } = player;
  if (matchResult === ValveMatchResult.TWon && startMatchTeamNumber === TeamNumber.CT) {
    return MatchResult.Victory;
  }

  if (matchResult === ValveMatchResult.CTWon && startMatchTeamNumber === TeamNumber.T) {
    return MatchResult.Victory;
  }

  return MatchResult.Defeat;
}

export function Sidebar() {
  const matches = useMatches();
  const selectedMatchId = useSelectedMatchId();
  const currentSteamId = useCurrentSteamId();
  const dispatch = useDispatch();

  return (
    <div className="border-r border-r-gray-300 overflow-auto min-w-fit">
      {matches.map((match) => {
        const playerLoggedOnSteam = match.players.find((player) => player.steamId === currentSteamId);
        const result = getMatchResultForPlayerFromMatchResult(match.result, playerLoggedOnSteam);

        let scoreOnTheLeft = match.scoreTeamStartedCT;
        let scoreOnTheRight = match.scoreTeamStartedT;
        let sideOnTheLeft: TeamNumber = TeamNumber.CT;
        let sideOnTheRight: TeamNumber = TeamNumber.T;
        if (playerLoggedOnSteam !== undefined) {
          const hasPlayerStartedAsCT = playerLoggedOnSteam.startMatchTeamNumber === TeamNumber.CT;
          if (hasPlayerStartedAsCT) {
            scoreOnTheLeft = match.scoreTeamStartedCT;
            scoreOnTheRight = match.scoreTeamStartedT;
            sideOnTheLeft = TeamNumber.CT;
            sideOnTheRight = TeamNumber.T;
          } else {
            scoreOnTheLeft = match.scoreTeamStartedT;
            scoreOnTheRight = match.scoreTeamStartedCT;
            sideOnTheLeft = TeamNumber.T;
            sideOnTheRight = TeamNumber.CT;
          }
        }

        return (
          <MatchEntry
            key={match.id}
            mapName={match.mapName}
            game={match.game}
            date={match.date}
            scoreOnTheLeft={scoreOnTheLeft}
            scoreOnTheRight={scoreOnTheRight}
            sideOnTheLeft={sideOnTheLeft}
            sideOnTheRight={sideOnTheRight}
            duration={match.durationInSeconds}
            isSelected={selectedMatchId === match.id}
            selectMatch={() => {
              dispatch(matchSelected({ matchId: match.id }));
            }}
            result={result}
            downloadStatus={match.downloadStatus}
          />
        );
      })}
    </div>
  );
}
