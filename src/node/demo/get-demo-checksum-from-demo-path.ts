import fs from 'fs-extra';
import { getDemoChecksumFromFileStats } from './get-demo-checksum-from-file-stats';
import { getDemoHeader } from './get-demo-header';

export async function getDemoChecksumFromDemoPath(demoFilePath: string) {
  const header = await getDemoHeader(demoFilePath);
  const stats = await fs.stat(demoFilePath);
  return getDemoChecksumFromFileStats(header, stats);
}
