import crypto from 'node:crypto';
import fs from 'fs-extra';
import { getClusterFolderPath, getClusterStateFilePath } from './embedded-postgres-paths';

export type ClusterState = {
  // Generated at initdb time, it's the password of the cluster's only role.
  // It's not stored in settings.json because that file is displayed in the settings UI.
  password: string;
  // Last port the cluster listened on. Only a hint: the authoritative value when the cluster is
  // running is the one written in postmaster.pid.
  port?: number;
};

async function readClusterState(): Promise<ClusterState | undefined> {
  try {
    const content = await fs.readFile(getClusterStateFilePath(), 'utf8');

    return JSON.parse(content) as ClusterState;
  } catch {
    return undefined;
  }
}

export async function writeClusterState(state: ClusterState) {
  await fs.ensureDir(getClusterFolderPath());
  await fs.writeFile(getClusterStateFilePath(), JSON.stringify(state, null, 2), { mode: 0o600 });
}

export async function readOrCreateClusterState(): Promise<ClusterState> {
  const state = await readClusterState();
  if (state !== undefined) {
    return state;
  }

  const newState: ClusterState = {
    password: crypto.randomBytes(24).toString('base64url'),
  };
  await writeClusterState(newState);

  return newState;
}
