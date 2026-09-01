export type Daemon = {
  version: string;
  busy: boolean;
  // Whether the daemon is a dev build. Dev and production daemons use separate discovery files (~/.csdm-dev vs
  // ~/.csdm), so a daemon must never assume a daemon of the other flavor is discoverable by its own spawner.
  isDev: boolean;
};
