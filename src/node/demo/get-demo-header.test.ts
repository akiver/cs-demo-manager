import { describe, expect, it } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import { getDemoHeader } from './get-demo-header';

// Demos are real demos shaved to contain only the header + a bit of their original bytes.
describe('Get demo header', () => {
  const demosPath = path.resolve(__dirname, 'fixtures');

  it('should parse Source 1 demos', async () => {
    let demos = await fs.readdir(demosPath);
    demos = demos.filter((file) => {
      return file.startsWith('source_1_');
    });

    for (const demo of demos) {
      const header = await getDemoHeader(path.resolve(demosPath, demo));
      expect(header).toMatchSnapshot();
    }
  });

  it('should parse Source 2 demos', async () => {
    let demos = await fs.readdir(demosPath);
    demos = demos.filter((file) => {
      return file.startsWith('source_2_');
    });

    for (const demo of demos) {
      const header = await getDemoHeader(path.resolve(demosPath, demo));
      expect(header).toMatchSnapshot();
    }
  });
});
