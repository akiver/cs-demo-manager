import React from 'react';
import { useDispatch } from '../../store/use-dispatch';
import { MatchEntry } from '../sidebar/match-entry';
import { MatchResult } from '../match-result';
import { useRenownMatches } from './use-renown-matches';
import { useSelectedMatchId } from './use-selected-match-id';
import { useCurrentRenownAccount } from './use-current-renown-account';
import { matchSelected } from './renown-actions';
import type { RenownAccount } from 'csdm/common/types/renown-account';
import type { RenownMatch } from 'csdm/common/types/renown-match';

function getMatchResult(currentAccount: RenownAccount | undefined, match: RenownMatch) {
  if (!currentAccount) {
    return MatchResult.Unplayed;
  }

  const currentPlayer = match.players.find((player) => player.steamId === currentAccount.id);
  if (!currentPlayer) {
    return MatchResult.Unplayed;
  }

  return match.winnerTeamName === currentPlayer.teamName ? MatchResult.Victory : MatchResult.Defeat;
}

export function Sidebar() {
  const matches = useRenownMatches();
  const selectedMatchId = useSelectedMatchId();
  const currentAccount = useCurrentRenownAccount();
  const dispatch = useDispatch();

  return (
    <div className="min-w-fit overflow-auto border-r border-r-gray-300">
      {matches.map((match) => {
        return (
          <MatchEntry
            key={match.id}
            date={match.date}
            game={match.game}
            duration={match.durationInSeconds}
            isSelected={match.id === selectedMatchId}
            mapName={match.mapName}
            scoreOnTheLeft={match.team1.score}
            scoreOnTheRight={match.team2.score}
            selectMatch={() => {
              dispatch(matchSelected({ matchId: match.id }));
            }}
            result={getMatchResult(currentAccount, match)}
            downloadStatus={match.downloadStatus}
          />
        );
      })}
    </div>
  );
}
