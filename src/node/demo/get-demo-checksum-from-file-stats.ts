import type { StatsBase } from 'node:fs';
import { crc64 } from 'crc64-ecma';
import type { DemoHeader } from 'csdm/node/demo/get-demo-header';

// ! Demos checksums are based on .dem file headers because it would be slower to read the whole file.
export function getDemoChecksumFromFileStats(header: DemoHeader, stats: StatsBase<number>) {
  let data: string;
  if (header.filestamp === 'HL2DEMO') {
    const { serverName, clientName, mapName, networkProtocol, playbackFrames, playbackTicks, signonLength } = header;
    data = `${mapName}${serverName}${clientName}${playbackFrames}${playbackTicks}${networkProtocol}${signonLength}${stats.size}`;
  } else {
    const { buildNumber, clientName, demoVersionGuid, demoVersionName, mapName, networkProtocol, serverName } = header;
    data = `${mapName}${serverName}${clientName}${networkProtocol}${buildNumber}${demoVersionGuid}${demoVersionName}${stats.size}`;
  }

  const checksum = crc64(data).toString(16);

  return checksum;
}
