import type { MatchInformation } from 'csgo-sharecode';
import { decodeMatchShareCode, InvalidShareCode as InvalidShareCodeError } from 'csgo-sharecode';
import { startBoiler } from 'csdm/node/boiler/start-boiler';
import { getValveMatchFromMatchInfoProtobufMesssage } from 'csdm/node/valve-match/get-valve-match-from-match-info-protobuf-message';
import { NoMatchesFound } from 'csdm/node/boiler/errors/no-matches-found';
import { updateValvePlayersFromSteam } from 'csdm/node/valve-match/update-valve-players-from-steam';
import { DecodeShareCodeError } from 'csdm/node/download/errors/decode-sharecode-error';
import { assertDownloadFolderIsValid } from 'csdm/node/download/assert-download-folder-is-valid';
import { InvalidShareCode } from 'csdm/node/download/errors/invalid-share-code';
import { buildDownloadFromValveMatch } from 'csdm/common/download/build-download-from-valve-match';
import { DownloadLinkExpired } from './errors/download-link-expired';
import { isDownloadLinkExpired } from './is-download-link-expired';

export async function buildDownloadFromShareCode(shareCode: string) {
  await assertDownloadFolderIsValid();

  let matchInformation: MatchInformation;
  try {
    matchInformation = decodeMatchShareCode(shareCode);
  } catch (error) {
    if (error instanceof InvalidShareCodeError) {
      throw new InvalidShareCode(shareCode);
    }

    throw new DecodeShareCodeError(shareCode);
  }

  const { matchId, reservationId, tvPort } = matchInformation;
  const matchIdAsString = matchId.toString();
  const reservationIdAsString = reservationId.toString();

  const matchListMessage = await startBoiler({
    args: [matchIdAsString, reservationIdAsString, tvPort.toString()],
    onExit: (code) => {
      logger.log('boiler exit with code', code);
    },
  });

  const { matches } = matchListMessage;
  if (matches.length === 0) {
    throw new NoMatchesFound();
  }

  const match = getValveMatchFromMatchInfoProtobufMesssage(matches[0]);
  const isDemoLinkExpired = await isDownloadLinkExpired(match.demoUrl);
  if (isDemoLinkExpired) {
    throw new DownloadLinkExpired();
  }

  await updateValvePlayersFromSteam(match.players);

  const download = buildDownloadFromValveMatch(match);
  return download;
}
