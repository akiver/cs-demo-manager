import { server } from 'csdm/server/server';

export async function isCs2ConnectedToServerHandler() {
  return Promise.resolve(server.isGameConnected());
}
