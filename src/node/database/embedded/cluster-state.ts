import crypto from 'node:crypto';
import fs from 'fs-extra';
import { getClusterFolderPath, getClusterStateFilePath } from './embedded-postgres-paths';
import { EmbeddedPostgresStateMissing } from './errors/embedded-postgres-state-missing';

export type ClusterState = {
  // Generated at initdb time, it's the password of the cluster's only role.
  // It's not stored in settings.json because that file is displayed in the settings UI.
  password: string;
  // Last port the cluster listened on. Only a hint: the authoritative value when the cluster is
  // running is the one written in postmaster.pid.
  port?: number;
};

function parseClusterState(content: string): ClusterState | undefined {
  let state: unknown;
  try {
    state = JSON.parse(content);
  } catch {
    return undefined;
  }

  if (typeof state !== 'object' || state === null) {
    return undefined;
  }

  const { password, port } = state as Partial<ClusterState>;
  if (typeof password !== 'string' || password === '') {
    return undefined;
  }

  // ! An out-of-range port is dropped rather than kept: it's only a hint, and passing it to
  // net.listen() would fail the whole start instead of resolving a new port.
  const isPortUsable = typeof port === 'number' && Number.isInteger(port) && port > 0 && port <= 65_535;

  return {
    password,
    port: isPortUsable ? port : undefined,
  };
}

async function readClusterState(): Promise<ClusterState | undefined> {
  try {
    return parseClusterState(await fs.readFile(getClusterStateFilePath(), 'utf8'));
  } catch {
    return undefined;
  }
}

export async function writeClusterState(state: ClusterState) {
  const stateFilePath = getClusterStateFilePath();
  await fs.ensureDir(getClusterFolderPath());

  // ! Written through a temporary file: a partial write would look like a lost state file and the
  // cluster would become unreachable, its password can't be recovered from anywhere else.
  const temporaryFilePath = `${stateFilePath}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporaryFilePath, JSON.stringify(state, null, 2), { mode: 0o600 });
    await fs.rename(temporaryFilePath, stateFilePath);
  } catch (error) {
    await fs.remove(temporaryFilePath);
    throw error;
  }
}

/**
 * Returns the state of the cluster, creating it on the first launch.
 *
 * ! Generating a password is only valid when there is no cluster yet: initdb is what stores it in
 * the data folder. Doing it for an initialized cluster would replace the only copy of a password
 * that is still the one the cluster expects, and every connection would fail with "password
 * authentication failed" from then on.
 */
export async function readOrCreateClusterState(isClusterInitialized: boolean): Promise<ClusterState> {
  const state = await readClusterState();
  if (state !== undefined) {
    return state;
  }

  if (isClusterInitialized) {
    throw new EmbeddedPostgresStateMissing(getClusterStateFilePath());
  }

  const newState: ClusterState = {
    password: crypto.randomBytes(24).toString('base64url'),
  };
  await writeClusterState(newState);

  return newState;
}
