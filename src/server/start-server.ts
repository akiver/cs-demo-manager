process.env.PROCESS_NAME = 'server';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import 'csdm/server/install-global-overrides';
import { server } from 'csdm/server/server';
import { writeDaemonInfoFile, deleteDaemonInfoFile } from 'csdm/node/daemon/daemon-info-file';
import { startIdleMonitor } from 'csdm/server/idle-monitor/idle-monitor';
import pkg from '../../package.json' with { type: 'json' };

process.on('uncaughtException', logger.error);
process.on('unhandledRejection', logger.error);

async function startServer() {
  const port = await server.listen();
  await writeDaemonInfoFile({
    port,
    pid: process.pid,
    version: pkg.version,
  });

  startIdleMonitor();

  const shutdown = async () => {
    try {
      await deleteDaemonInfoFile();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void startServer();
