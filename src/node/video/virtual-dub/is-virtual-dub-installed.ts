import { getInstalledVirtualDubVersion } from './get-installed-virtual-dub-version';

export async function isVirtualDubInstalled() {
  const installedVirtualDubVersion = await getInstalledVirtualDubVersion();

  return installedVirtualDubVersion !== undefined;
}
