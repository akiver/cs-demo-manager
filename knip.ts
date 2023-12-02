import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/ui/renderer.tsx',
    'src/server/server.ts',
    'src/cli/cli.ts',
    'src/electron-main/main.ts',
    'src/preload/preload.ts',
    'src/server/dev-preload.ts',
  ],
  project: ['src/**/*.{ts,tsx}', '!**/*.test.{ts,tsx}'],
  exclude: ['nsTypes', 'nsExports', 'dependencies', 'unlisted'],
  ignore: [
    '**/*/lingui.config.ts',
    'src/ui/hooks/use-focus-layers.ts',
    'src/electron-main/web-socket/web-socket-client.ts',
  ],
  vitest: false,
};

export default config;
