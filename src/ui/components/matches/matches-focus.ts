import type { MatchTable } from 'csdm/common/types/match-table';
import type { SortDirection } from 'csdm/ui/components/table/table-types';

// The player or team that the "result", "team score" and "opponent score" columns are relative to.
export type MatchesFocus =
  | {
      type: 'pinned-player' | 'player';
      steamId: string;
    }
  | {
      type: 'team';
      teamName: string;
    };

type FocusScores = {
  score: number;
  opponentScore: number;
};

export function getFocusScores(match: MatchTable, focus: MatchesFocus): FocusScores | undefined {
  // Can't tell which side is the focused one if both teams have the same name.
  if (match.teamAName === match.teamBName) {
    return undefined;
  }

  const teamName =
    focus.type === 'team' ? focus.teamName : match.players.find((player) => player.steamId === focus.steamId)?.teamName;

  if (teamName === match.teamAName) {
    return { score: match.teamAScore, opponentScore: match.teamBScore };
  }

  if (teamName === match.teamBName) {
    return { score: match.teamBScore, opponentScore: match.teamAScore };
  }

  return undefined;
}

// Returns 1 for a win, 0 for a tie and -1 for a loss.
export function getFocusResult(match: MatchTable, focus: MatchesFocus) {
  const scores = getFocusScores(match, focus);
  if (scores === undefined) {
    return undefined;
  }

  return Math.sign(scores.score - scores.opponentScore);
}

// Matches without a value (focus not in the match) are always at the bottom, whatever the sort direction.
export function buildFocusSortFunction(getValue: (match: MatchTable) => number | undefined) {
  return (sortDirection: SortDirection | undefined) => {
    return (matchA: MatchTable, matchB: MatchTable) => {
      const valueA = getValue(matchA);
      const valueB = getValue(matchB);

      if (valueA === undefined && valueB === undefined) {
        return 0;
      }

      if (valueA === undefined) {
        return 1;
      }

      if (valueB === undefined) {
        return -1;
      }

      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    };
  };
}
