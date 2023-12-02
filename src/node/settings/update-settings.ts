import type { Options } from 'deepmerge';
import deepMerge from 'deepmerge';
import { getSettings } from './get-settings';
import type { Settings } from './settings';
import { writeSettings } from './write-settings';

export type UpdateSettingsOptions = {
  // When set to true the input source array will be the new array.
  // Given the following array: ['apple', 'banana', 'lemon', 'apricot']
  // And the following input array: ['apple', 'lemon']
  // The final array will be: ['apple', 'lemon']
  preserveSourceArray: boolean;
};

function preserveSourceArray(destinationArray: unknown[], sourceArray: unknown[]) {
  return sourceArray;
}

export async function updateSettings(partialSettings: DeepPartial<Settings>, options?: UpdateSettingsOptions) {
  const mergeOptions: Options = {};
  if (options?.preserveSourceArray === true) {
    mergeOptions.arrayMerge = preserveSourceArray;
  }

  const currentSettings = await getSettings();
  const newSettings = deepMerge(currentSettings, partialSettings, mergeOptions) as Settings;
  await writeSettings(newSettings);

  return newSettings;
}
