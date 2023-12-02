import os from 'node:os';

export type AppInformation = {
  platform: NodeJS.Platform;
  arch: NodeJS.Architecture;
  osVersion: string;
  electronVersion: string;
  chromeVersion: string;
};

export function getAppInformation(): AppInformation {
  return {
    platform: process.platform,
    arch: process.arch,
    osVersion: os.release(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
  };
}
