import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';

type EvermeetResponse = {
  version: string;
};

function findVersionFromGitHubRelease(release: GitHubReleaseResponse) {
  let versionsFound: string[] = [];
  for (const asset of release.assets) {
    const regex = isWindows
      ? /ffmpeg-n.*-latest-win64-gpl-(\d+\.\d+(\.\d+)?)\.zip/g
      : /ffmpeg-n.*-latest-linux64-gpl-(\d+\.\d+(\.\d+)?)\.tar\.xz/g;
    const matches = regex.exec(asset.name);
    if (matches !== null) {
      versionsFound = [...versionsFound, matches[1]];
    }
  }

  if (versionsFound.length === 0) {
    throw new Error('FFMpeg version not found');
  }

  return versionsFound.sort().reverse()[0];
}

export async function fetchLastFfmpegVersion(): Promise<string> {
  let version: string;
  if (isMac) {
    const response = await fetch('https://evermeet.cx/ffmpeg/info/ffmpeg/release');
    const data: EvermeetResponse = await response.json();
    version = data.version;
  } else {
    const response = await fetch('https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/latest');
    const release: GitHubReleaseResponse = await response.json();
    version = findVersionFromGitHubRelease(release);
  }

  return version;
}
