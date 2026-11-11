import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/server/start-server.ts', 'src/cli/cli.ts', 'src/electron-main/main.ts', 'src/preload/preload.ts'],
  project: ['src/**/*.{ts,mts,tsx}', '!**/*.test.{ts,tsx}'],
  rules: {
    devDependencies: 'off',
  },
  ignoreDependencies: ['@lingui/core'],
  ignoreBinaries: ['tasklist'],
};

export default config;
