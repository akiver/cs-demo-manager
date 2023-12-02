import fs from 'fs-extra';
import type { CDataGCCStrike15_v2_MatchInfo, CMsgGCCStrike15_v2_MatchList } from 'csgo-protobuf';
import { startBoiler } from 'csdm/node/boiler/start-boiler';
import { getValveMatchFromMatchInfoProtobufMesssage } from 'csdm/node/valve-match/get-valve-match-from-match-info-protobuf-message';
import { getMatchDemoPath } from 'csdm/node/valve-match/get-match-demo-path';
import { DownloadStatus } from 'csdm/common/types/download-status';
import type { ValveMatch } from 'csdm/common/types/valve-match';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { updateValvePlayersFromSteam } from 'csdm/node/valve-match/update-valve-players-from-steam';
import { getSettings } from 'csdm/node/settings/get-settings';
import { InvalidDemoHeader } from 'csdm/node/demo/errors/invalid-demo-header';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';

async function getDownloadStatus(downloadFolderPath: string | undefined, match: ValveMatch) {
  if (downloadFolderPath !== undefined) {
    const demoPath = getMatchDemoPath(downloadFolderPath, match);
    const infoPath = `${demoPath}.info`;
    const [demoExists, infoPathFileExists] = await Promise.all([fs.pathExists(demoPath), fs.pathExists(infoPath)]);
    if (demoExists && infoPathFileExists) {
      return DownloadStatus.Downloaded;
    }
  }

  const downloadLinkExpired = await isDownloadLinkExpired(match.demoUrl);

  return downloadLinkExpired ? DownloadStatus.Expired : DownloadStatus.NotDownloaded;
}

async function buildValveMatchFromProtobufMessage(
  matchMessage: CDataGCCStrike15_v2_MatchInfo,
  downloadFolderPath: string | undefined,
) {
  const match = getValveMatchFromMatchInfoProtobufMesssage(matchMessage);
  await updateValvePlayersFromSteam(match.players);

  match.downloadStatus = await getDownloadStatus(downloadFolderPath, match);
  if (downloadFolderPath !== undefined) {
    const demoPath = getMatchDemoPath(downloadFolderPath, match);
    const demoExists = await fs.pathExists(demoPath);
    if (demoExists) {
      try {
        match.demoChecksum = await getDemoChecksumFromDemoPath(demoPath);
      } catch (error) {
        if (!(error instanceof InvalidDemoHeader)) {
          throw error;
        }
      }
    }
  }

  return match;
}

export async function fetchLastValveMatches(onSteamIdDetected: (steamId: string) => void) {
  const matchListMessage: CMsgGCCStrike15_v2_MatchList = await startBoiler({
    onSteamIdDetected,
    onExit: (code) => {
      logger.log('boiler exit with code', code);
    },
  });

  const settings = await getSettings();
  const downloadFolderPath = settings.download.folderPath;
  const matches: ValveMatch[] = await Promise.all(
    matchListMessage.matches.map(async (match) => {
      return await buildValveMatchFromProtobufMessage(match, downloadFolderPath);
    }),
  );

  return matches;
}
