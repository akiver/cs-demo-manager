import React from 'react';
import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import { useDispatch } from '../../store/use-dispatch';
import { MatchEntry } from '../sidebar/match-entry';
import { MatchResult } from '../match-result';
import { matchSelected } from './faceit-actions';
import { useCurrentFaceitAccount } from './use-current-faceit-account';
import { useFaceitMatches } from './use-faceit-matches';
import { useSelectedMatchId } from './use-selected-match-id';

function getMatchResult(currentAccount: FaceitAccount | undefined, match: FaceitMatch) {
  if (currentAccount === undefined) {
    return MatchResult.Unplayed;
  }

  const currentPlayer = match.players.find((player) => player.id === currentAccount.id);

  if (currentPlayer === undefined) {
    return MatchResult.Unplayed;
  }

  return match.winnerId === currentPlayer.teamId ? MatchResult.Victory : MatchResult.Defeat;
}

export function Sidebar() {
  const matches = useFaceitMatches();
  const selectedMatchId = useSelectedMatchId();
  const currentAccount = useCurrentFaceitAccount();
  const dispatch = useDispatch();

  return (
    <div className="border-r border-r-gray-300 overflow-auto min-w-fit">
      {matches.map((match) => {
        return (
          <MatchEntry
            key={match.id}
            date={match.date}
            game={match.game}
            duration={match.durationInSeconds}
            isSelected={match.id === selectedMatchId}
            mapName={match.mapName}
            scoreOnTheLeft={match.teams[0].score}
            // Sometimes there is only one team https://www.faceit.com/en/cs2/room/1-cf691eae-3371-4b7e-bfe2-785ba16d66a4/scoreboard
            scoreOnTheRight={match.teams[1]?.score ?? 0}
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
