import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';

type EvermeetResponse = {
  version: string;
};

export type FfmpegRelease = {
  version: string;
  assetName: string;
};

function compareSemver(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function findFfmpegGitHubAsset(release: GitHubReleaseResponse): FfmpegRelease {
  const assetsFound: FfmpegRelease[] = [];
  for (const asset of release.assets) {
    const regex = isWindows
      ? /^ffmpeg-n([\d.]+)-\d+-g[a-f0-9]+-win64-gpl-[\d.]+\.zip$/
      : /^ffmpeg-n([\d.]+)-\d+-g[a-f0-9]+-linux64-gpl-[\d.]+\.tar\.xz$/;
    const match = regex.exec(asset.name);
    if (match !== null) {
      assetsFound.push({ version: match[1], assetName: asset.name });
    }
  }

  if (assetsFound.length === 0) {
    throw new Error('FFMpeg version not found');
  }

  return assetsFound.sort((a, b) => compareSemver(b.version, a.version))[0];
}

export async function fetchLastFfmpegRelease(): Promise<FfmpegRelease> {
  if (isMac) {
    const response = await fetch('https://evermeet.cx/ffmpeg/info/ffmpeg/release');
    const data: EvermeetResponse = await response.json();
    return { version: data.version, assetName: `ffmpeg-${data.version}.zip` };
  }

  const response = await fetch('https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/latest');
  const release: GitHubReleaseResponse = await response.json();
  return findFfmpegGitHubAsset(release);
}

export async function fetchLastFfmpegVersion(): Promise<string> {
  const { version } = await fetchLastFfmpegRelease();
  return version;
}
