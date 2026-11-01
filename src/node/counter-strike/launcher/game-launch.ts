// Starting the game kills the game of any previous launch. The exit handler of that previous game would then run its
// cleanup while the new launch is being prepared. This would delete the JSON actions file written for the new launch
// (it is written before the game is started), uninstall the plugin the new launch just installed, and report the exit
// it didn't cause as a game error. A launch that is no longer the current one must leave all of that to the new launch.
let currentLaunchId = 0;

export function beginGameLaunch() {
  currentLaunchId++;

  return currentLaunchId;
}

export function isCurrentGameLaunch(launchId: number) {
  return launchId === currentLaunchId;
}
