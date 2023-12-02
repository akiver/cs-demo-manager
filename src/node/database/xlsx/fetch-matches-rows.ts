import { TeamLetter } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';

export type MatchRow = {
  checksum: string;
  name: string;
  demoPath: string;
  date: Date;
  source: string;
  mapName: string;
  serverName: string;
  clientName: string;
  duration: number;
  tickrate: number;
  tickCount: number;
  frameRate: number;
  nameTeamA: string;
  nameTeamB: string;
  scoreTeamA: number;
  scoreTeamB: number;
  killCount: number;
  assistCount: number;
  deathCount: number;
  bombPlantedCount: number;
  bombDefusedCount: number;
  clutchCount: number;
};

export async function fetchMatchesRows(checksums: string[]) {
  const { count } = db.fn;
  const rows: MatchRow[] = await db
    .selectFrom('matches')
    .select([
      'matches.checksum',
      'matches.name',
      'matches.demo_path as demoPath',
      'date',
      'source',
      'map_name as mapName',
      'server_name as serverName',
      'client_name as clientName',
      'duration',
      'tickrate',
      'tick_count as tickCount',
      'kill_count as killCount',
      'assist_count as assistCount',
      'death_count as deathCount',
      'framerate as frameRate',
    ])
    .innerJoin('teams as teamA', function (qb) {
      return qb.onRef('teamA.match_checksum', '=', 'matches.checksum').on('teamA.letter', '=', TeamLetter.A);
    })
    .select(['teamA.name as nameTeamA', 'teamA.score as scoreTeamA'])
    .innerJoin('teams as teamB', function (qb) {
      return qb.onRef('teamB.match_checksum', '=', 'matches.checksum').on('teamB.letter', '=', TeamLetter.B);
    })
    .select(['teamB.name as nameTeamB', 'teamB.score as scoreTeamB'])
    .leftJoin('bombs_planted', 'bombs_planted.match_checksum', 'matches.checksum')
    .select(count<number>('bombs_planted.id').distinct().as('bombPlantedCount'))
    .leftJoin('bombs_defused', 'bombs_defused.match_checksum', 'matches.checksum')
    .select(count<number>('bombs_defused.id').distinct().as('bombDefusedCount'))
    .leftJoin('clutches', 'clutches.match_checksum', 'matches.checksum')
    .select(count<number>('clutches.id').distinct().as('clutchCount'))
    .where('checksum', 'in', checksums)
    .groupBy(['matches.checksum', 'nameTeamA', 'nameTeamB', 'scoreTeamA', 'scoreTeamB'])
    .execute();

  return rows;
}
