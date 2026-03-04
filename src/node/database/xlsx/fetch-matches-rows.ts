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
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .innerJoin('teams as teamA', function (qb) {
      return qb.onRef('teamA.match_checksum', '=', 'matches.checksum').on('teamA.letter', '=', TeamLetter.A);
    })
    .innerJoin('teams as teamB', function (qb) {
      return qb.onRef('teamB.match_checksum', '=', 'matches.checksum').on('teamB.letter', '=', TeamLetter.B);
    })
    .leftJoin('bombs_planted', 'bombs_planted.match_checksum', 'matches.checksum')
    .leftJoin('bombs_defused', 'bombs_defused.match_checksum', 'matches.checksum')
    .leftJoin('clutches', 'clutches.match_checksum', 'matches.checksum')
    .where('matches.checksum', 'in', checksums)
    .select([
      'matches.checksum',
      'matches.demo_path as demoPath',
      'matches.kill_count as killCount',
      'matches.death_count as deathCount',
      'matches.assist_count as assistCount',
      'demos.name',
      'demos.source',
      'demos.date',
      'demos.map_name as mapName',
      'demos.tick_count as tickCount',
      'demos.tickrate',
      'demos.framerate as frameRate',
      'demos.duration',
      'demos.server_name as serverName',
      'demos.client_name as clientName',
      'teamA.name as nameTeamA',
      'teamA.score as scoreTeamA',
      'teamB.name as nameTeamB',
      'teamB.score as scoreTeamB',
      count<number>('bombs_planted.id').distinct().as('bombPlantedCount'),
      count<number>('bombs_defused.id').distinct().as('bombDefusedCount'),
      count<number>('clutches.id').distinct().as('clutchCount'),
    ])
    .groupBy([
      'matches.checksum',
      'nameTeamA',
      'nameTeamB',
      'scoreTeamA',
      'scoreTeamB',
      'demos.name',
      'demos.source',
      'demos.date',
      'demos.map_name',
      'demos.tick_count',
      'demos.tickrate',
      'demos.framerate',
      'demos.duration',
      'demos.server_name',
      'demos.client_name',
    ])
    .execute();

  return rows;
}
