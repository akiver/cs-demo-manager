import type { FiveEPlayMatch, FiveEPlayPlayer } from 'csdm/common/types/5eplay-match';
import { FiveEPlayResourceNotFound } from './errors/5eplay-resource-not-found';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';
import { Game } from 'csdm/common/types/counter-strike';
import { getDownloadStatus } from 'csdm/node/download/get-download-status';
import { roundNumber } from 'csdm/common/math/round-number';

type PlayerInfo = {
  fight: {
    adr: string;
    assist: string;
    death: string;
    defused_bomb: string;
    explode_bomb: string;
    first_death: string;
    first_kill: string;
    headshot: string;
    kast: string;
    kill: string;
    kill_3: string;
    kill_4: string;
    kill_5: string;
    per_headshot: string;
    planted_bomb: string;
    rws: string;
    team_kill: string;
    is_win: string;
  };
  user_info: {
    user_data: {
      uuid: string;
      uid: number;
      domain: string;
      username: string;
      profile: {
        avatarUrl: string;
      };
    };
  };
};

type MatchNotFoundPayload = {
  code: 500;
  data: null;
};

type ResponsePayload =
  | MatchNotFoundPayload
  | {
      code: 0;
      data: {
        main: {
          cs_type: 0 | 1; // 0 = CS2, 1 = CSGO
          start_time: number;
          end_time: number;
          demo_url: string;
          map: string;
          match_winner: number; // 1 = Team 1, 2 = Team 2
          round_total: number;
          // Teams info
          group1_uids: string; // Comma separated list of player uids
          group1_all_score: number; // Team 1 score
          group1_fh_role: number; // Team 1 side (1 = CT, 0 = T)
          group1_fh_score: number; // Team 1 First half score
          group1_sh_score: number; // Team 1 Second half score
          group2_uids: string; // Comma separated list of player uids
          group2_all_score: number; // Team 2 score
          group2_fh_role: number; // Team 2 side (1 = CT, 0 = T)
          group2_fh_score: number; // Team 2 First half score
          group2_sh_score: number; // Team 2 Second half score
        };
        group_1: PlayerInfo[];
        group_2: PlayerInfo[];
      };
    };

export async function fetch5EPlayMatch(
  matchId: string,
  downloadFolderPath: string | undefined,
): Promise<FiveEPlayMatch> {
  const response = await fetch(`https://gate.5eplay.com/crane/http/api/data/match/${matchId}`);
  const data: ResponsePayload = await response.json();

  if (data.data === null) {
    throw new FiveEPlayResourceNotFound();
  }

  const { main: match, group_1: team1, group_2: team2 } = data.data;

  return {
    id: matchId,
    downloadStatus: await getDownloadStatus(downloadFolderPath, matchId, match.demo_url),
    date: unixTimestampToDate(match.start_time).toISOString(),
    demoUrl: match.demo_url,
    durationInSeconds: match.end_time - match.start_time,
    game: match.cs_type === 0 ? Game.CS2 : Game.CSGO,
    mapName: match.map,
    url: `https://arena.5eplay.com/data/match/${matchId}`,
    teams: [
      {
        name: 'Team 1',
        score: match.group1_all_score,
        firstHalfScore: match.group1_fh_score,
        secondHalfScore: match.group1_sh_score,
        playerIds: match.group1_uids.split(',').map(Number),
      },
      {
        name: 'Team 2',
        score: match.group2_all_score,
        firstHalfScore: match.group2_fh_score,
        secondHalfScore: match.group2_sh_score,
        playerIds: match.group2_uids.split(',').map(Number),
      },
    ],
    players: [team1, team2].flatMap((group) => {
      return group.map<FiveEPlayPlayer>((data) => {
        const player = data.fight;
        const user = data.user_info.user_data;
        return {
          id: user.uuid,
          uid: user.uid,
          domainId: user.domain,
          name: user.username,
          avatarUrl: `https://oss-arena.5eplay.com/${data.user_info.user_data.profile.avatarUrl}`,
          killCount: Number(player.kill),
          assistCount: Number(player.assist),
          deathCount: Number(player.death),
          headshotCount: Number(player.headshot),
          headshotPercentage: roundNumber(Number(player.per_headshot) * 100),
          killDeathRatio: roundNumber(Number(player.kill) / Number(player.death), 1),
          killPerRound: roundNumber(Number(player.kill) / Number(match.round_total), 1),
          kast: Number(player.kast),
          threeKillCount: Number(player.kill_3),
          fourKillCount: Number(player.kill_4),
          fiveKillCount: Number(player.kill_5),
          hasWon: player.is_win === '1',
          firstKillCount: Number(player.first_kill),
          firstDeathCount: Number(player.first_death),
          bombDefusedCount: Number(player.defused_bomb),
          bombPlantedCount: Number(player.planted_bomb),
          averageDamagePerRound: Number(player.adr),
        };
      });
    }),
  };
}
