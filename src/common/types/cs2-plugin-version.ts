// Numbers are the CS2 network protocol/Steam "PatchVersion" field that the plugin supports up to
// the CS2 build it is compatible with.
// So for example, 14030 means the plugin supports CS2 builds up to the 1.40.3.0 version.
export const CS2PluginVersion = {
  '14030': '14030', // Support from the beta to the 3rd October 2024 update ("Armory").
  '14088': '14088', // Support between the "Armory" update and the 28th July 2025 update ("Animation").
  '14094': '14094', // Support between the 28th July 2025 update ("Animation") and the 14th August 2025 update.
  latest: 'latest',
} as const;

export type CS2PluginVersion = (typeof CS2PluginVersion)[keyof typeof CS2PluginVersion];
