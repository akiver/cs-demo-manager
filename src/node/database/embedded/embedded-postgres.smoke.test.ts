import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'fs-extra';
import { Client } from 'pg';
import { afterAll, describe, expect, it, vi } from 'vite-plus/test';
import { startEmbeddedCluster, type EmbeddedClusterSession } from './start-cluster';
import { releaseEmbeddedClusterSession, stopEmbeddedCluster } from './stop-cluster';
import { resetEmbeddedCluster } from './reset-cluster';
import { findRunningCluster } from './read-postmaster-pid';

const { rootFolderPath } = vi.hoisted(() => {
  // GitHub's Windows RUNNER_TEMP is on D:, where initdb cannot tighten the directory ACL. The app
  // stores its real cluster under LOCALAPPDATA on C:, so TEMP is the representative location.
  const temporaryFolderPath =
    process.platform === 'win32'
      ? (process.env.TEMP ?? process.env.TMP ?? 'C:\\Windows\\Temp')
      : (process.env.RUNNER_TEMP ?? process.env.TMP ?? '/tmp');
  return { rootFolderPath: `${temporaryFolderPath}/csdm-embedded-postgres-smoke-${process.pid}` };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/node/filesystem/get-static-folder-path', () => {
  return { getStaticFolderPath: () => `${process.cwd()}/static` };
});
vi.mock('./embedded-postgres-paths', () => {
  const clusterFolderPath = path.join(rootFolderPath, 'postgres');

  return {
    getClusterFolderPath: () => clusterFolderPath,
    getClusterDataFolderPath: () => path.join(clusterFolderPath, 'pgdata'),
    getClusterLogFilePath: () => path.join(clusterFolderPath, 'pgdata.log'),
    getClusterStateFilePath: () => path.join(clusterFolderPath, 'state.json'),
    getClusterLockFilePath: () => path.join(rootFolderPath, 'lifecycle.lock'),
    getClusterUsageLockFilePath: () => path.join(rootFolderPath, 'usage.lock'),
  };
});

afterAll(async () => {
  if (await stopEmbeddedCluster()) {
    await fs.remove(rootFolderPath);
  }
});

async function connectToMaintenanceDatabase(session: EmbeddedClusterSession) {
  const client = new Client({
    host: session.settings.hostname,
    port: session.settings.port,
    user: session.settings.username,
    password: session.settings.password,
    database: 'postgres',
  });
  await client.connect();

  return client;
}

function waitForChildOutput(child: ChildProcess, expectedOutput: string) {
  return new Promise<void>((resolve, reject) => {
    child.once('error', reject);
    child.stdout?.on('data', (data: Buffer) => {
      if (data.toString().includes(expectedOutput)) {
        resolve();
      }
    });
  });
}

async function stopChild(child: ChildProcess | undefined) {
  if (child === undefined || child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const exited = new Promise<void>((resolve) => {
    child.once('exit', () => resolve());
  });
  child.kill();
  await exited;
}

describe('embedded PostgreSQL real lifecycle', () => {
  it(
    'should reuse across app/CLI leases, preserve another user on shutdown and reset only when unused',
    { timeout: 120_000 },
    async () => {
      await fs.remove(rootFolderPath);
      const sessions: EmbeddedClusterSession[] = [];
      const clients: Client[] = [];
      let cliProcess: ChildProcess | undefined;

      try {
        const firstSession = await startEmbeddedCluster();
        sessions.push(firstSession);
        const secondSession = await startEmbeddedCluster();
        sessions.push(secondSession);
        expect(secondSession.settings.port).toBe(firstSession.settings.port);

        const client = await connectToMaintenanceDatabase(firstSession);
        clients.push(client);
        await client.query('CREATE TABLE csdm_smoke_test (id integer primary key)');
        await client.query('INSERT INTO csdm_smoke_test VALUES (1)');

        const helperPath = path.join(import.meta.dirname, 'cluster-lock-child.mjs');
        cliProcess = spawn(process.execPath, [helperPath, path.join(rootFolderPath, 'usage.lock'), 'shared'], {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        });
        await waitForChildOutput(cliProcess, 'locked');

        await releaseEmbeddedClusterSession(firstSession, { stopIfUnused: true });
        await expect(findRunningCluster(path.join(rootFolderPath, 'postgres', 'pgdata'))).resolves.toBeDefined();

        await client.end();
        await releaseEmbeddedClusterSession(secondSession, { stopIfUnused: true });
        await expect(findRunningCluster(path.join(rootFolderPath, 'postgres', 'pgdata'))).resolves.toBeDefined();
        await expect(resetEmbeddedCluster()).rejects.toThrow('currently used');
        await expect(findRunningCluster(path.join(rootFolderPath, 'postgres', 'pgdata'))).resolves.toBeDefined();
        await stopChild(cliProcess);
        cliProcess = undefined;
        await resetEmbeddedCluster();

        const resetSession = await startEmbeddedCluster();
        sessions.push(resetSession);
        const resetClient = await connectToMaintenanceDatabase(resetSession);
        clients.push(resetClient);
        const result = await resetClient.query<{ table_name: string | null }>(
          "SELECT to_regclass('public.csdm_smoke_test')::text AS table_name",
        );
        expect(result.rows[0]?.table_name).toBeNull();

        await resetClient.end();
        await releaseEmbeddedClusterSession(resetSession, { stopIfUnused: true });
        await expect(findRunningCluster(path.join(rootFolderPath, 'postgres', 'pgdata'))).resolves.toBeUndefined();
      } finally {
        await stopChild(cliProcess);
        await Promise.allSettled(clients.map((client) => client.end()));
        await Promise.allSettled(
          sessions.map((session) => {
            return releaseEmbeddedClusterSession(session, { stopIfUnused: false });
          }),
        );
        await stopEmbeddedCluster();
      }
    },
  );
});
