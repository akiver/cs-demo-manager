import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { getClusterFolderPath } from './embedded-postgres-paths';

vi.mock('csdm/node/filesystem/get-app-folder-path', () => {
  return {
    getAppFolderPath: () => path.join(path.sep, 'home', 'csdm', '.csdm'),
  };
});

const localAppDataFolderPath = process.env.LOCALAPPDATA;

afterEach(() => {
  // Assigning undefined would store the string "undefined", which is a path like any other.
  if (localAppDataFolderPath === undefined) {
    delete process.env.LOCALAPPDATA;
  } else {
    process.env.LOCALAPPDATA = localAppDataFolderPath;
  }
});

describe('getClusterFolderPath', () => {
  // A relative path would put the cluster next to the current working directory, which is also what
  // a failed initialization deletes.
  it('should never return a relative path', () => {
    for (const value of ['', 'AppData\\Local', ' ']) {
      process.env.LOCALAPPDATA = value;

      expect(path.isAbsolute(getClusterFolderPath())).toBe(true);
    }
  });
});
