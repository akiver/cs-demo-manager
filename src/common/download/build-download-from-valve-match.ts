import type { ValveMatch } from 'csdm/common/types/valve-match';
import type { ValveDownload } from './download-types';
import { DownloadSource } from './download-types';

export function buildDownloadFromValveMatch(match: ValveMatch): ValveDownload {
  return {
    source: DownloadSource.Valve,
    game: match.game,
    matchId: match.id,
    demoUrl: match.demoUrl,
    fileName: match.name,
    match: match,
  };
}
