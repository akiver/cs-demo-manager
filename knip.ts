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
  rules: {
    devDependencies: 'off',
  },
  ignore: ['**/*/lingui.config.ts', 'src/node/settings/migrations/*.ts', 'src/node/database/migrations/**/*.ts'],
  ignoreDependencies: ['@lingui/core'],
};

export default config;
