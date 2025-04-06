import fs from 'fs-extra';
import path from 'node:path';
import { CDataGCCStrike15_v2_MatchInfoSchema, fromBinary } from 'csgo-protobuf';
import { getDemoChecksumFromFileStats } from './get-demo-checksum-from-file-stats';
import type { Demo } from 'csdm/common/types/demo';
import { DemoSource, DemoType, Game } from 'csdm/common/types/counter-strike';
import { getDemoHeader, type DemoHeader } from './get-demo-header';
import { DemoNotFound } from 'csdm/node/counter-strike/launcher/errors/demo-not-found';
import { getDemoInfoFilePath } from 'csdm/node/demo/get-demo-info-file-path';
import { getValveMatchFromMatchInfoProtobufMesssage } from 'csdm/node/valve-match/get-valve-match-from-match-info-protobuf-message';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';

function getDemoType(header: DemoHeader): DemoType {
  const serverName = header.serverName.toLowerCase();
  const localRegex = new RegExp('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d+(\\:\\d{1,5})?$');
  const localRegex2 = new RegExp('=\\[[a-zA-Z]:\\d+:\\d+:\\d+\\]');

  if (
    serverName.includes('localhost') ||
    localRegex.exec(serverName) !== null ||
    localRegex2.exec(serverName) !== null
  ) {
    return DemoType.POV;
  }

  return DemoType.GOTV;
}

function getDemoSource(demoHeader: DemoHeader, demoName: string): DemoSource {
  const faceitRegex = /\d+_team[\da-z-]+-team[\da-z-]+_de_[\da-z]+\\.dem/;

  const serverName = demoHeader.serverName.toLowerCase();
  const fileName = demoName.toLowerCase();
  if (serverName.includes('faceit') || serverName.includes('blast') || faceitRegex.exec(fileName) !== null) {
    return DemoSource.FaceIt;
  }

  if (serverName.includes('cevo')) {
    return DemoSource.Cevo;
  }

  if (serverName.includes('challengermode') || serverName.includes('pgl major cs2')) {
    return DemoSource.Challengermode;
  }

  if (serverName.includes('esl')) {
    return DemoSource.Esl;
  }

  const ebotRegex = /(\d*)_(.*?)-(.*?)_(.*?)(.dem)/;
  if (serverName.includes('ebot') || ebotRegex.exec(fileName) !== null) {
    return DemoSource.Ebot;
  }

  if (serverName.includes('esea') || fileName.includes('esea')) {
    return DemoSource.Esea;
  }

  if (serverName.includes('popflash') || fileName.includes('popflash')) {
    return DemoSource.Popflash;
  }

  if (serverName.includes('esportal')) {
    return DemoSource.Esportal;
  }

  if (serverName.includes('fastcup')) {
    return DemoSource.Fastcup;
  }

  if (serverName.includes('gamersclub')) {
    return DemoSource.Gamersclub;
  }

  if (fileName.includes('renown') || serverName.includes('renown')) {
    return DemoSource.Renown;
  }

  // Default format: {TIME}_{MATCH_ID}_{MAP}_{TEAM1}_vs_{TEAM2}
  // https://shobhit-pathak.github.io/MatchZy/gotv/#recording-demos
  const matchZyDemoNameRegex = /^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_(\d+)_([a-zA-Z0-9_]+)_(.+?)_vs_(.+)$/;
  if (serverName.includes('matchzy') || matchZyDemoNameRegex.exec(fileName) !== null) {
    return DemoSource.MatchZy;
  }

  if (serverName.includes('valve')) {
    return DemoSource.Valve;
  }

  if (serverName.includes('完美世界')) {
    return DemoSource.PerfectWorld;
  }

  const fiveEPlayRegex = /^g\d+-(.*)[a-zA-Z0-9_]*$/;
  if (fiveEPlayRegex.exec(fileName) !== null) {
    return DemoSource.FiveEPlay;
  }

  if (serverName.includes('esplay')) {
    return DemoSource.Esplay;
  }

  return DemoSource.Unknown;
}

function getDemoMapNameFromHeader(demoHeader: DemoHeader): string {
  // Remove potential "_scrimmagemap" suffix.
  // Noticed with a de_mirage demo, it could be related to the fact that de_mirage has been moved from competitive maps
  // to unranked maps (called "scrimmage" maps back in 2019). It may be the case with others maps too.
  let mapName = demoHeader.mapName.replaceAll('_scrimmagemap', '');

  // Remove potential workshop identifier prefix (i.e workshop/id/map_name).
  // Noticed with some FACEIT demos:
  // https://www.faceit.com/en/csgo/room/1-e1d60431-30f8-43d3-9985-0135500a7a97
  // https://www.faceit.com/en/csgo/room/1-f6e8327d-ce85-44f4-84ac-74b19b8ec738
  // Every time it's because the match's map is an old version, that's probably the reason.
  const workshopRegex = /workshop\/(\d+\/)(?<mapName>.*)/;
  const matches = mapName.match(workshopRegex);
  if (matches) {
    mapName = matches.groups?.mapName || mapName;
  }

  return mapName;
}

async function updateDemoFromInfoFile(demo: Demo) {
  try {
    const infoFilePath = getDemoInfoFilePath(demo.filePath);
    const infoFileExists = await fs.pathExists(infoFilePath);

    if (!infoFileExists) {
      return;
    }

    const buffer = await fs.readFile(infoFilePath);
    const bytes = new Uint8Array(buffer);
    const matchMessage = fromBinary(CDataGCCStrike15_v2_MatchInfoSchema, bytes);
    const match = getValveMatchFromMatchInfoProtobufMesssage(matchMessage);
    // Force the map's name to be the one from the file header because those in .info files may not be accurate
    // since maps values may change between CS operations and are hard coded.
    match.mapName = demo.mapName;
    match.demoChecksum = demo.checksum;
    // The game detection is more accurate when it comes from the .dem header than the .info file.
    match.game = demo.game;
    demo.date = match.date;
    demo.duration = match.durationInSeconds;
    demo.valveMatch = match;
    demo.shareCode = match.sharecode;
  } catch (error) {
    logger.error('Error while updating demo from .info file');
    logger.error(error);
  }
}

async function buildDemoFromFilePath(filePath: string): Promise<Demo> {
  const header = await getDemoHeader(filePath);
  const stats = await fs.stat(filePath);
  const mapName = getDemoMapNameFromHeader(header);
  const checksum = getDemoChecksumFromFileStats(header, stats);
  const name = path.parse(filePath).name;
  const dateTimestamp = +(stats.mtimeMs / 1000).toFixed(0);
  const date = unixTimestampToDate(dateTimestamp).toISOString();
  const source = getDemoSource(header, name);
  const type = getDemoType(header);

  let tickrate = 0;
  let frameRate = 0;
  let tickCount = 0;
  let duration = 0;
  let buildNumber = 0;
  let game: Game;
  if (header.filestamp === 'HL2DEMO') {
    game = Game.CSGO;
    tickCount = header.playbackTicks;
    duration = header.playbackTime;
    if (duration > 0) {
      tickrate = tickCount / duration;
      frameRate = header.playbackFrames / duration;
    }
  } else {
    buildNumber = header.buildNumber;
    // The build number of CS2 when it was publicly available is 9832, everything below is coming from the limited test.
    if (buildNumber < 9832) {
      game = Game.CS2LT;
    } else {
      game = Game.CS2;
    }
  }

  const demo: Demo = {
    checksum,
    filePath,
    game,
    name,
    source,
    type,
    date,
    serverName: header.serverName,
    clientName: header.clientName,
    tickCount,
    tickrate,
    frameRate,
    duration,
    networkProtocol: header.networkProtocol,
    buildNumber,
    mapName,
    comment: '',
    shareCode: '',
    tagIds: [],
  };

  await updateDemoFromInfoFile(demo);

  return demo;
}

export async function getDemoFromFilePath(filePath: string): Promise<Demo> {
  const demoExists = await fs.pathExists(filePath);
  if (!demoExists) {
    throw new DemoNotFound();
  }

  const demo = await buildDemoFromFilePath(filePath);

  return demo;
}
