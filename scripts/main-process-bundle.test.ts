import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';

const buildScriptNames = ['build.mjs', 'develop.mjs'] as const;

function extractMainProcessBundleSource(source: string) {
  const startMarker = 'async function buildMainProcessBundle()';
  const endMarker = 'async function buildPreloadBundle()';
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Unable to find the main process bundle configuration');
  }

  return source.slice(startIndex, endIndex);
}

describe('main process bundle', () => {
  for (const scriptName of buildScriptNames) {
    it(`externalizes native file locking in ${scriptName}`, async () => {
      const scriptPath = fileURLToPath(new URL(scriptName, import.meta.url));
      const source = await fs.readFile(scriptPath, 'utf8');
      const mainProcessBundleSource = extractMainProcessBundleSource(source);
      const externalModules = mainProcessBundleSource.match(/external:\s*\[([^\]]+)]/)?.[1];

      expect(externalModules).toContain("'electron'");
      expect(externalModules).toContain("'fs-native-extensions'");
    });
  }
});
