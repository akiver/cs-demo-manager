import type { Transaction, UpdateResult } from 'kysely';
import { TeamLetter } from '@akiver/cs-demo-analyzer';
import { db } from '../database';
import type { Database } from 'csdm/node/database/schema';
import { isEmptyString } from 'csdm/common/string/is-empty-string';
import { DuplicateTeamNameError } from 'csdm/node/database/teams/errors/duplicate-team-name-error';
import {
  fetchTeamNamesPerChecksum,
  type TeamNamesPerChecksum,
} from 'csdm/node/database/matches/fetch-team-names-per-checksum';
import { TeamsNotFound } from 'csdm/node/database/teams/errors/teams-not-found';

type UpdateTeamNameArgs = {
  transaction: Transaction<Database>;
  checksum: string;
  oldName: string;
  newName: string;
  opponentTeamName: string;
  letter: TeamLetter;
};

async function updateTeamName({
  transaction,
  oldName,
  checksum,
  newName,
  letter,
  opponentTeamName,
}: UpdateTeamNameArgs) {
  if (isEmptyString(newName) || newName === oldName) {
    return oldName;
  }

  if (newName === opponentTeamName) {
    throw new DuplicateTeamNameError(newName);
  }

  const promises: Promise<UpdateResult[]>[] = [
    transaction
      .updateTable('teams')
      .set({
        name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('letter', '=', letter)
      .execute(),
    transaction
      .updateTable('matches')
      .set({
        winner_name: newName,
      })
      .where('checksum', '=', checksum)
      .where('winner_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('players')
      .set({
        team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('rounds')
      .set(
        letter === TeamLetter.A
          ? {
              team_a_name: newName,
            }
          : {
              team_b_name: newName,
            },
      )
      .where('match_checksum', '=', checksum)
      .where(letter === TeamLetter.A ? 'team_a_name' : 'team_b_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('rounds')
      .set({
        winner_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('winner_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('kills')
      .set({
        killer_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('killer_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('kills')
      .set({
        victim_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('victim_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('kills')
      .set({
        assister_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('assister_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('damages')
      .set({
        attacker_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('attacker_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('damages')
      .set({
        victim_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('victim_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('decoys_start')
      .set({
        thrower_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('thrower_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('flashbangs_explode')
      .set({
        thrower_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('thrower_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('grenade_bounces')
      .set({
        thrower_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('thrower_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('grenade_positions')
      .set({
        thrower_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('thrower_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('grenade_projectiles_destroy')
      .set({
        thrower_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('thrower_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('he_grenades_explode')
      .set({
        thrower_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('thrower_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('shots')
      .set({
        player_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('player_team_name', '=', oldName)
      .execute(),
    transaction
      .updateTable('smokes_start')
      .set({
        thrower_team_name: newName,
      })
      .where('match_checksum', '=', checksum)
      .where('thrower_team_name', '=', oldName)
      .execute(),
  ];

  await Promise.all(promises);

  return newName;
}

type UpdateMatchesTeamNamesArgs = {
  checksums: string[];
  teamNameA: string;
  teamNameB: string;
  onProgress: (updatedCount: number) => void;
  signal: AbortSignal;
};

export async function updateMatchesTeamNames({
  checksums,
  teamNameA,
  teamNameB,
  onProgress,
  signal,
}: UpdateMatchesTeamNamesArgs) {
  if (teamNameA === teamNameB) {
    throw new DuplicateTeamNameError(teamNameA);
  }

  const teamNamesPerChecksum = await fetchTeamNamesPerChecksum(checksums);

  const updates: TeamNamesPerChecksum = {};
  for (const [index, checksum] of checksums.entries()) {
    const names = teamNamesPerChecksum[checksum];
    if (!names) {
      throw new TeamsNotFound();
    }

    await db.transaction().execute(async (transaction) => {
      const newTeamNameA = await updateTeamName({
        transaction,
        checksum,
        oldName: names.teamNameA,
        newName: teamNameA,
        letter: TeamLetter.A,
        opponentTeamName: isEmptyString(teamNameB) ? names.teamNameB : teamNameB,
      });
      const newTeamNameB = await updateTeamName({
        transaction,
        checksum,
        oldName: names.teamNameB,
        newName: teamNameB,
        letter: TeamLetter.B,
        opponentTeamName: isEmptyString(teamNameA) ? names.teamNameA : teamNameA,
      });

      if (newTeamNameA !== names.teamNameA || newTeamNameB !== names.teamNameB) {
        updates[checksum] = {
          teamNameA: newTeamNameA,
          teamNameB: newTeamNameB,
        };
      }
    });

    onProgress(index + 1);

    if (signal.aborted) {
      break;
    }
  }

  return updates;
}
