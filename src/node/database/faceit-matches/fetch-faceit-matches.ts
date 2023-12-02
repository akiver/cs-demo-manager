import { getSettings } from 'csdm/node/settings/get-settings';
import { db } from 'csdm/node/database/database';
import { faceitMatchRowToFaceitMatch } from './faceit-match-row-to-faceit-match';

export async function fetchFaceitMatches(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const [matchRows, playerRows, teamRows] = await Promise.all([
    db.selectFrom('faceit_matches').selectAll().where('id', 'in', ids).execute(),
    db.selectFrom('faceit_match_players').selectAll().where('faceit_match_id', 'in', ids).execute(),
    db.selectFrom('faceit_match_teams').selectAll().where('faceit_match_id', 'in', ids).execute(),
  ]);

  const settings = await getSettings();
  const downloadFolderPath = settings.download.folderPath;
  const promises = matchRows.map(async (matchRow) => {
    const players = playerRows.filter((playerRow) => playerRow.faceit_match_id === matchRow.id);
    const teams = teamRows.filter((teamRow) => teamRow.faceit_match_id === matchRow.id);
    return faceitMatchRowToFaceitMatch(matchRow, players, teams, downloadFolderPath);
  });

  const matches = await Promise.all(promises);

  return matches;
}
