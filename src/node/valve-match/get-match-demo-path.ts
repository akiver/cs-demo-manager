import path from 'node:path';
import type { ValveMatch } from 'csdm/common/types/valve-match';

export function getMatchDemoPath(downloadFolderPath: string, match: ValveMatch): string {
  return `${downloadFolderPath}${path.sep}${match.name}.dem`;
}
