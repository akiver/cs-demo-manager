import { db } from '../database';

type Data = {
  serverName: string;
  clientName: string;
  tickCount: number;
  tickrate: number;
  frameRate: number;
  duration: number;
};

export async function updateDemo(checksum: string, data: Data) {
  await db
    .updateTable('demos')
    .set({
      tick_count: data.tickCount,
      tickrate: data.tickrate,
      framerate: data.frameRate,
      duration: data.duration,
      server_name: data.serverName,
      client_name: data.clientName,
    })
    .where('checksum', '=', checksum)
    .execute();
}
