import type { DownloadStatus } from 'csdm/common/types/download-status';
import type { FaceitMatch, FaceitPlayer, FaceitTeam } from 'csdm/common/types/faceit-match';
import { fetchFaceitMatchStats } from 'csdm/node/faceit-web-api/fetch-match-stats';
import type { FaceitMatchDTO } from 'csdm/node/faceit-web-api/fetch-match';
import type { FaceitMatchStatsDTO } from 'csdm/node/faceit-web-api/fetch-match-stats';
import { fetchMatch } from 'csdm/node/faceit-web-api/fetch-match';
import type { FaceitFactionDTO } from 'csdm/node/faceit-web-api/fetch-match';
import type { FaceitFactionV1DTO } from 'csdm/node/faceit-web-api/fetch-match';
import { getDownloadStatus } from 'csdm/node/download/get-download-status';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';
import { Game } from 'csdm/common/types/counter-strike';

function isFactionV1(faction: FaceitFactionDTO | FaceitFactionV1DTO): faction is FaceitFactionV1DTO {
  return (faction as FaceitFactionV1DTO).roster_v1 !== undefined;
}

function getAvatarUrlPerPlayerId(matchDTO: FaceitMatchDTO) {
  const avatarPerPlayerId: { [playerId: string]: string } = {};
  const { faction1, faction2 } = matchDTO.teams;
  for (const faction of [faction1, faction2]) {
    if (isFactionV1(faction)) {
      for (const player of faction.roster_v1) {
        avatarPerPlayerId[player.guid] = player.avatar;
      }
    } else {
      for (const player of faction.roster) {
        avatarPerPlayerId[player.player_id] = player.avatar;
      }
    }
  }

  return avatarPerPlayerId;
}

async function buildFaceitMatchFromFaceitDTOs(
  matchDTO: FaceitMatchDTO,
  teamsStatsDTO: FaceitMatchStatsDTO,
  downloadFolderPath: string | undefined,
) {
  if (teamsStatsDTO.rounds.length === 0) {
    throw new Error('No rounds found');
  }

  const players: FaceitPlayer[] = [];
  const teams: FaceitTeam[] = [];

  let winnerName = '';
  let winnerId = '';
  const firstRoundStats = teamsStatsDTO.rounds[0]; // The first round entry contains all information about the match
  for (const team of firstRoundStats.teams) {
    if (team.team_stats['Team Win'] === '1') {
      winnerName = team.team_stats.Team;
      winnerId = team.team_id;
    }

    const avatarUrlPerPlayerId: { [playerId: string]: string } = getAvatarUrlPerPlayerId(matchDTO);
    teams.push({
      id: team.team_id,
      name: team.team_stats.Team,
      score: Number(team.team_stats['Final Score']),
      firstHalfScore: Number(team.team_stats['First Half Score']),
      overtimeScore: Number(team.team_stats['Overtime score']),
      secondHalfScore: Number(team.team_stats['Second Half Score']),
    });

    for (const player of team.players) {
      players.push({
        id: player.player_id,
        name: player.nickname,
        teamId: team.team_id,
        teamName: team.team_stats.Team,
        avatarUrl: avatarUrlPerPlayerId[player.player_id] || '',
        killCount: Number(player.player_stats.Kills),
        assistCount: Number(player.player_stats.Assists),
        deathCount: Number(player.player_stats.Deaths),
        headshotCount: Number(player.player_stats.Headshots),
        headshotPercentage: Number(player.player_stats['Headshots %']),
        killDeathRatio: Number(player.player_stats['K/D Ratio']),
        mvpCount: Number(player.player_stats.MVPs),
        killPerRound: Number(player.player_stats['K/R Ratio']),
        threeKillCount: Number(player.player_stats['Triple Kills']),
        fourKillCount: Number(player.player_stats['Quadro Kills']),
        fiveKillCount: Number(player.player_stats['Penta Kills']),
      });
    }
  }

  let demoUrl = '';
  const demoUrls = matchDTO.demo_url;
  // FACEIT demos links are now private and require access to the "Downloads API".
  // https://docs.faceit.com/getting-started/Guides/download-api
  // I sent an access request the 24/11/2023 but in the meantime FACEIT downloads will not work.
  if (demoUrls !== undefined && demoUrls.length > 0) {
    demoUrl = demoUrls[0];
  }
  const downloadStatus: DownloadStatus = await getDownloadStatus(downloadFolderPath, matchDTO.match_id, demoUrl);

  // Remove potential workshop identifier prefix from map's name (i.e workshop/id/map_name).
  const workshopRegex = /workshop\/(\d+\/)(?<mapName>.*)/;
  const matches = firstRoundStats.round_stats.Map.match(workshopRegex);

  const match: FaceitMatch = {
    game: matchDTO.game === 'cs2' ? Game.CS2 : Game.CSGO,
    date: unixTimestampToDate(matchDTO.started_at).toISOString(),
    id: matchDTO.match_id,
    mapName: matches?.groups?.mapName || firstRoundStats.round_stats.Map,
    demoUrl,
    players,
    teams,
    gameMode: firstRoundStats.game_mode,
    url: matchDTO.faceit_url.replace('{lang}', 'en'),
    durationInSeconds: matchDTO.finished_at - matchDTO.started_at,
    winnerName,
    winnerId,
    downloadStatus,
  };

  return match;
}

export async function fetchFaceitMatch(matchId: string, apiKey: string, downloadFolderPath: string | undefined) {
  const [matchDTO, statsDTO]: [FaceitMatchDTO, FaceitMatchStatsDTO] = await Promise.all([
    fetchMatch(matchId, apiKey),
    fetchFaceitMatchStats(matchId, apiKey),
  ]);
  const match = await buildFaceitMatchFromFaceitDTOs(matchDTO, statsDTO, downloadFolderPath);

  return match;
}
