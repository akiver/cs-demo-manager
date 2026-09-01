import './server-setup';
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
  try {
    const port = await server.listen();
    await writeDaemonInfoFile({
      port,
      pid: process.pid,
      version: pkg.version,
    });

    startIdleMonitor();
  } catch (error) {
    // Without the discovery file the daemon is unreachable but still holds the port, and the idle monitor may not be
    // running yet: exit instead of lingering as a zombie that would block every future daemon startup.
    logger.error('Error while starting the daemon, exiting');
    logger.error(error);
    process.exit(1);
  }

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
