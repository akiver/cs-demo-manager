import React from 'react';
import { useDispatch } from '../../store/use-dispatch';
import { MatchEntry } from '../sidebar/match-entry';
import { MatchResult } from '../match-result';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';
import { use5EPlayState } from './use-5eplay-state';
import { useCurrent5EPlayAccount } from './use-current-5eplay-account';
import { matchSelected } from './5eplay-actions';

function getMatchResult(currentAccount: FiveEPlayAccount | undefined, match: FiveEPlayMatch) {
  if (currentAccount === undefined) {
    return MatchResult.Unplayed;
  }

  const currentPlayer = match.players.find((player) => player.id === currentAccount.id);

  if (currentPlayer === undefined) {
    return MatchResult.Unplayed;
  }

  return currentPlayer.hasWon ? MatchResult.Victory : MatchResult.Defeat;
}

export function FiveEPlayDownloadSidebar() {
  const { matches, selectedMatchId } = use5EPlayState();
  const currentAccount = useCurrent5EPlayAccount();
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
            scoreOnTheRight={match.teams[1].score}
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
