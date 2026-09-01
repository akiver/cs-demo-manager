export type Daemon = {
  version: string;
  busy: boolean;
  // Number of connected clients (probe sockets excluded). An outdated daemon must not be replaced while clients are
  // attached to it, even if it has no work in progress.
  clientCount: number;
  // Whether the daemon is a dev build. Dev and production daemons use separate discovery files (~/.csdm-dev vs
  // ~/.csdm), so a daemon must never assume a daemon of the other flavor is discoverable by its own spawner.
  isDev: boolean;
};
