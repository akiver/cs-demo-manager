// TODO quality Review versions accuracy
// Numbers are the CS2 network protocol/Steam "PatchVersion" field that the plugin supports up to
// the CS2 build it is compatible with.
// So for example, 14030 means the plugin supports CS2 builds up to the 1.40.3.0 version.
export const CS2PluginVersion = {
  '14030': '14030', // Support from the beta to the 3rd October 2024 update ("Armory").
  '14088': '14088', // Support between the "Armory" update and the 28th July 2025 update ("Animation").
  '14094': '14094', // Support between the 28th July 2025 update ("Animation") and the 14th August 2025 update.
  '14103': '14103', // Support between the 14th August 2025 update and the 17th September 2025 update.
  '14112': '14112', // Support between the 17th September 2025 update and the 15th October 2025 update.
  // Support between the 15th October 2025 update and the 8th April 2026 update ("Animgraph 2")
  // https://github.com/SteamTracking/GameTracking-CS2/commit/c15581f2903059b296c3a71766fcf5effd6278bd
  '14152': '14152',
  // Support between "Animgraph 2" update (8th April 2026) and the 09/07/2026 update (1.41.6.8).
  // https://github.com/SteamTracking/GameTracking-CS2/commit/382cfd288910a2d774a6e6d10428a83416e60da2#diff-1590b30cfb9c4e3984a6ebef95e19ebce0ac0fb786fc22c6d6de4443a52a236f
  '14168': '14168',
  latest: 'latest',
} as const;

export type CS2PluginVersion = (typeof CS2PluginVersion)[keyof typeof CS2PluginVersion];
