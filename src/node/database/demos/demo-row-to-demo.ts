import type { Demo } from 'csdm/common/types/demo';
import type { DemoRow } from 'csdm/node/database/demos/demo-table';
import type { ColumnID } from 'csdm/common/types/column-id';

export function demoRowToDemo(row: DemoRow, filePath: string, tagIds: ColumnID[], comment: string | null): Demo {
  return {
    checksum: row.checksum,
    game: row.game,
    filePath,
    name: row.name,
    source: row.source,
    type: row.type,
    date: row.date.toISOString(),
    networkProtocol: row.network_protocol,
    buildNumber: row.build_number,
    serverName: row.server_name,
    clientName: row.client_name,
    tickCount: row.tick_count,
    tickrate: row.tickrate,
    frameRate: row.framerate,
    duration: row.duration,
    mapName: row.map_name,
    shareCode: row.share_code,
    comment: comment ?? '',
    tagIds: tagIds.map(String),
  };
}
