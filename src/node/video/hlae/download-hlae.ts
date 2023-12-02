import { downloadAndExtractZipArchive } from 'csdm/node/filesystem/download-and-extract-zip-archive';
import { fetchLastHlaeRelease } from './fetch-last-hlae-release';

export async function downloadHlae(installationFolderPath: string): Promise<string> {
  let asset: GitHubAssetResponse;
  let lastRelease: GitHubReleaseResponse;

  try {
    lastRelease = await fetchLastHlaeRelease();
    asset = lastRelease.assets[0];
    if (asset === undefined) {
      throw new Error('Unable to retrieve HLAE release from GitHub');
    }
  } catch (error) {
    logger.error(error);
    throw new Error('An error occurred while contacting GitHub');
  }

  try {
    const zipUrl = asset.browser_download_url;
    await downloadAndExtractZipArchive(zipUrl, installationFolderPath);
    const version = lastRelease.tag_name.slice(1, lastRelease.tag_name.length);

    return version;
  } catch (error) {
    logger.error(error);
    throw new Error('An error occurred while downloading zip archive');
  }
}
