import { encodeMatch } from 'csgo-sharecode';
import type {
  CDataGCCStrike15_v2_MatchInfo,
  CMsgGCCStrike15_v2_MatchmakingGC2ServerReserve,
  CMsgGCCStrike15_v2_MatchmakingServerRoundStats,
  TournamentTeam,
  WatchableMatchInfo,
} from 'csgo-protobuf';
import { Game, TeamNumber } from 'csdm/common/types/counter-strike';
import type { ValveMatch, ValvePlayer, ValvePlayerRound } from 'csdm/common/types/valve-match';
import { ValveMatchResult } from 'csdm/common/types/valve-match';
import { getMapName } from './get-map-name';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';

function sumNumberArray(numberArray: number[]): number {
  return numberArray.reduce((previous, current) => {
    return previous + current;
  }, 0);
}

function steamId3ToSteamId64(steamId3: number) {
  return (BigInt(0x01_10_00_01_00_00_00_00) + BigInt(steamId3)).toString();
}

export function getLastRoundStatsMessage(matchInfoMessage: CDataGCCStrike15_v2_MatchInfo) {
  const { roundstatsLegacy, roundstatsall } = matchInfoMessage;

  return roundstatsLegacy ?? roundstatsall[roundstatsall.length - 1];
}

function getMatchResult(lastRoundMsg: CMsgGCCStrike15_v2_MatchmakingServerRoundStats): ValveMatchResult {
  const matchResult = lastRoundMsg.matchResult;

  if (matchResult === undefined) {
    return ValveMatchResult.Tied;
  }

  if (matchResult === 1) {
    return ValveMatchResult.TWon;
  }

  return ValveMatchResult.CTWon;
}

export function buildMatchName(lastRoundReservationId: bigint, tvPort: number, serverIp: number) {
  return `match730_${lastRoundReservationId.toString().padStart(21, '0')}_${tvPort
    .toString()
    .padStart(10, '0')}_${serverIp}`;
}

function getTeamNames(tournamentTeams: TournamentTeam[]) {
  let teamNameStartedCT = 'Team CT';
  let teamNameStartedT = 'Team T';
  if (tournamentTeams.length >= 2) {
    teamNameStartedCT = tournamentTeams[0].teamName as string;
    teamNameStartedT = tournamentTeams[1].teamName as string;
  }

  return { teamNameStartedCT, teamNameStartedT };
}

function getPlayerStartedTeamNumber(accountIds: number[], steamId3: number) {
  // Index 0 to 4 => players that started as CT
  // Index 5 to 9 => players that started as T
  const playerIndexLastRound = accountIds.indexOf(steamId3);
  const startMatchTeamNumber = playerIndexLastRound < 5 ? TeamNumber.CT : TeamNumber.T;

  return startMatchTeamNumber;
}

function getPlayerTeamNumberForRound(player: ValvePlayer, roundNumber: number) {
  if (roundNumber <= 15) {
    return player.startMatchTeamNumber;
  }
  if (roundNumber <= 30) {
    return player.startMatchTeamNumber === TeamNumber.CT ? TeamNumber.T : TeamNumber.CT;
  }

  // Handle overtimes available with official tournament events, it assumes it's an MR3 overtimes.
  const previousTeamNumber = player.rounds[roundNumber - 2].teamNumber;
  const overtimeRoundNumber = roundNumber - 30;
  const isBeginningOfOvertime = overtimeRoundNumber % 3 === 1;
  if (isBeginningOfOvertime) {
    return previousTeamNumber === TeamNumber.CT ? TeamNumber.T : TeamNumber.CT;
  }

  return previousTeamNumber;
}

export function getValveMatchFromMatchInfoProtobufMesssage(matchInfoMessage: CDataGCCStrike15_v2_MatchInfo) {
  const lastRoundMessage = getLastRoundStatsMessage(matchInfoMessage);
  const { roundstatsall, matchid, matchtime } = matchInfoMessage;
  const lastRoundReservation = lastRoundMessage.reservation as CMsgGCCStrike15_v2_MatchmakingGC2ServerReserve;
  const players: ValvePlayer[] = [];
  let currentScoreTeamThatStartedCt = 0;
  let currentScoreTeamThatStartedT = 0;

  if (roundstatsall.length > 0) {
    roundstatsall.map((roundMessage, roundIndex) => {
      const roundNumber = roundIndex + 1;
      const [scoreTeamStartedCt, scoreTeamStartedT] = roundMessage.teamScores;
      const { accountIds } = roundMessage.reservation as CMsgGCCStrike15_v2_MatchmakingGC2ServerReserve;
      for (const [playerIndex, steamId3] of accountIds.entries()) {
        const steamId64 = steamId3ToSteamId64(steamId3);
        let player = players.find((player) => player.steamId === steamId64);

        if (player === undefined) {
          const startMatchTeamNumber = getPlayerStartedTeamNumber(lastRoundReservation.accountIds, steamId3);
          player = {
            steamId: steamId64,
            name: `Player ${playerIndex + 1}`,
            avatar: '',
            killCount: 0,
            assistCount: 0,
            deathCount: 0,
            headshotCount: 0,
            mvp: 0,
            score: 0,
            startMatchTeamNumber,
            rounds: [],
          };
          players.push(player);
        }

        const hasPlayerWonRound = (player: ValvePlayer) => {
          if (player.startMatchTeamNumber === TeamNumber.CT) {
            return currentScoreTeamThatStartedCt !== scoreTeamStartedCt;
          }

          return currentScoreTeamThatStartedT !== scoreTeamStartedT;
        };

        const { kills, deaths, assists, enemyHeadshots, mvps, scores } = roundMessage;
        const round: ValvePlayerRound = {
          number: roundNumber,
          killCount: Math.max(0, kills[playerIndex] - player.killCount), // If the player killed himself, the sub may be -1
          deathCount: deaths[playerIndex] - player.deathCount,
          assistCount: assists[playerIndex] - player.assistCount,
          headshotCount: enemyHeadshots[playerIndex] - player.headshotCount,
          mvpCount: mvps[playerIndex] - player.mvp,
          hasWon: hasPlayerWonRound(player),
          teamNumber: getPlayerTeamNumberForRound(player, roundNumber),
        };
        player.rounds.push(round);

        player.killCount = kills[playerIndex];
        player.deathCount = deaths[playerIndex];
        player.assistCount = assists[playerIndex];
        player.score = scores[playerIndex];
        player.mvp = mvps[playerIndex];
        player.headshotCount = enemyHeadshots.length > playerIndex ? enemyHeadshots[playerIndex] : player.headshotCount;
      }

      currentScoreTeamThatStartedCt = scoreTeamStartedCt;
      currentScoreTeamThatStartedT = scoreTeamStartedT;
    });
  } else {
    // Old definitions, it doesn't contains rounds data
    const [scoreTeamStartedCt, scoreTeamStartedT] = lastRoundMessage.teamScores;
    currentScoreTeamThatStartedCt = scoreTeamStartedCt;
    currentScoreTeamThatStartedT = scoreTeamStartedT;

    const { accountIds } = lastRoundReservation;
    for (const [playerIndex, steamId3] of accountIds.entries()) {
      const startMatchTeamNumber = getPlayerStartedTeamNumber(accountIds, steamId3);
      const steamId64 = steamId3ToSteamId64(steamId3);
      const player: ValvePlayer = {
        steamId: steamId64,
        name: `Player ${playerIndex + 1}`,
        avatar: '',
        killCount: lastRoundMessage.kills[playerIndex],
        assistCount: lastRoundMessage.assists[playerIndex],
        deathCount: lastRoundMessage.deaths[playerIndex],
        headshotCount: lastRoundMessage.enemyHeadshots[playerIndex] || 0,
        mvp: lastRoundMessage.mvps[playerIndex],
        score: lastRoundMessage.scores[playerIndex],
        startMatchTeamNumber,
        rounds: [],
      };
      players.push(player);
    }
  }

  const matchId = matchid as bigint;
  const dateTimestamp = matchtime as number;
  const durationInSeconds = lastRoundMessage.matchDuration as number;
  const gameType = lastRoundReservation.gameType as number;
  const watchablematchinfo = matchInfoMessage.watchablematchinfo as WatchableMatchInfo;
  const tvPort = watchablematchinfo.tvPort as number;
  const serverIp = watchablematchinfo.serverIp as number;
  const lastRoundReservationId = lastRoundMessage.reservationid as bigint;
  const demoUrl = lastRoundMessage.map;
  const demoName = buildMatchName(lastRoundReservationId, tvPort, serverIp);
  const sharecode: string = encodeMatch({
    matchId: BigInt(matchId),
    reservationId: BigInt(lastRoundReservationId),
    tvPort,
  });
  const result = getMatchResult(lastRoundMessage);
  const { teamNameStartedCT, teamNameStartedT } = getTeamNames(lastRoundReservation.tournamentTeams);
  const date = unixTimestampToDate(dateTimestamp);
  // Didn't find a better way to detect the correct game :/
  // There is also maxRounds which is absent in old CSGO proto def or its value may be 16 (short match) or 30 (long match).
  // But this is probably not a good idea for the future.
  const publicCs2ReleaseDate = new Date('2023-09-27');
  const game = date >= publicCs2ReleaseDate ? Game.CS2 : Game.CSGO;

  const match: ValveMatch = {
    id: matchId.toString(),
    game,
    date: date.toUTCString(),
    durationInSeconds,
    result,
    scoreTeamStartedCT: currentScoreTeamThatStartedCt,
    scoreTeamStartedT: currentScoreTeamThatStartedT,
    killCount: sumNumberArray(lastRoundMessage.kills),
    assistCount: sumNumberArray(lastRoundMessage.assists),
    deathCount: sumNumberArray(lastRoundMessage.deaths),
    demoUrl,
    mapName: getMapName(gameType),
    sharecode,
    name: demoName,
    players,
    teamNameStartedT,
    teamNameStartedCT,
    downloadStatus: DownloadStatus.NotDownloaded,
    protobufBytes: matchInfoMessage.toBinary(),
  };

  return match;
}
