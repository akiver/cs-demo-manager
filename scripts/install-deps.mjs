import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import fs from 'fs-extra';
import { EMBEDDED_POSTGRESQL_PACKAGE_VERSION } from '../src/node/database/embedded/embedded-postgresql-version.ts';

const projectPath = fileURLToPath(new URL('..', import.meta.url));
const staticFolderPath = fileURLToPath(new URL('../static', import.meta.url));

export async function installCounterStrikeVoiceExtractor(platform = process.platform) {
  const supportedPlatforms = ['darwin', 'win32', 'linux'];
  if (!supportedPlatforms.includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const binPath = path.join(projectPath, 'node_modules/@akiver/csgo-voice-extractor/dist/bin', `${platform}-x64`);
  const destinationPath = path.join(staticFolderPath, 'csgove');
  await fs.copy(binPath, destinationPath);
}

export async function installBoilerWritter(platform = process.platform, arch = process.arch) {
  const supportedPlatforms = ['darwin-x64', 'darwin-arm64', 'win32-x64', 'linux-x64'];
  const binPath = `${platform}-${arch}`;
  if (!supportedPlatforms.includes(binPath)) {
    throw new Error(`Unsupported platform: ${binPath}`);
  }

  const npmBinPath = path.join(projectPath, 'node_modules/@akiver/boiler-writter/dist/bin', binPath);
  const destinationPath = path.join(staticFolderPath, 'boiler-writter');

  await fs.copy(npmBinPath, destinationPath);
}

export async function installDemoAnalyzer(platform = process.platform, arch = process.arch) {
  function getBinarySubpath() {
    const supportedPlatforms = {
      'darwin-x64': 'darwin-x64/csda',
      'darwin-arm64': 'darwin-arm64/csda',
      'linux-x64': 'linux-x64/csda',
      'linux-arm64': 'linux-arm64/csda',
      'win32-x64': 'windows-x64/csda.exe',
    };

    const platformKey = `${platform}-${arch}`;
    if (!supportedPlatforms[platformKey]) {
      throw new Error(`Unsupported platform: ${platformKey}`);
    }

    return supportedPlatforms[platformKey];
  }

  const npmBinPath = path.join(projectPath, 'node_modules/@akiver/cs-demo-analyzer/dist/bin', getBinarySubpath());
  const destinationPath = path.join(staticFolderPath, platform === 'win32' ? 'csda.exe' : 'csda');
  await fs.copy(npmBinPath, destinationPath);
}

/**
 * Downloads a file into destinationPath, through a temporary file so an interrupted download is never mistaken for a
 * complete one.
 *
 * @param {string} url
 * @param {string} destinationPath
 */
async function downloadFile(url, destinationPath) {
  console.log(`Downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok || response.body === null) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const temporaryPath = `${destinationPath}.download`;
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(temporaryPath));
  await fs.rename(temporaryPath, destinationPath);
}

/**
 * npm packages can't contain symbolic links, the @embedded-postgres packages list them in a JSON file instead and
 * re-create them in a postinstall script. Same here, with relative links so the folder can be moved.
 *
 * @param {string} folderPath Folder where the package's "native" folder has been extracted.
 */
async function hydrateSymbolicLinks(folderPath) {
  const symlinksFilePath = path.join(folderPath, 'pg-symlinks.json');
  if (!(await fs.pathExists(symlinksFilePath))) {
    return;
  }

  /** @type {{ source: string, target: string }[]} */
  const symlinks = await fs.readJson(symlinksFilePath);
  for (const { source, target } of symlinks) {
    // Paths in the file are relative to the package root and start with "native/".
    const sourcePath = path.join(folderPath, path.relative('native', source));
    const targetPath = path.join(folderPath, path.relative('native', target));
    if (!(await fs.pathExists(sourcePath)) || (await fs.pathExists(targetPath))) {
      continue;
    }

    await fs.symlink(path.relative(path.dirname(targetPath), sourcePath), targetPath);
  }

  await fs.remove(symlinksFilePath);
}

/**
 * Removes what the server doesn't need at runtime to reduce the app size: development files, documentation,
 * translated messages (the server runs with lc_messages=C) and tools unrelated to PostgreSQL itself.
 *
 * @param {string} folderPath
 * @param {NodeJS.Platform} platform
 */
async function removeUnusedPostgreSqlFiles(folderPath, platform) {
  const foldersToRemove = [
    'include',
    'lib/pkgconfig',
    'share/doc',
    'share/locale',
    'share/postgresql/doc',
    'share/postgresql/locale',
  ];
  for (const folder of foldersToRemove) {
    await fs.remove(path.join(folderPath, folder));
  }

  const libFolderPath = path.join(folderPath, 'lib');
  for (const fileName of await fs.readdir(libFolderPath)) {
    if (fileName.endsWith('.a')) {
      await fs.remove(path.join(libFolderPath, fileName));
    }
  }

  if (platform === 'win32') {
    const binFolderPath = path.join(folderPath, 'bin');
    for (const fileName of await fs.readdir(binFolderPath)) {
      // wxWidgets libraries are used by the StackBuilder tool of the Windows distribution, not by the server.
      if (fileName.startsWith('wx') || fileName === 'testplug.dll') {
        await fs.remove(path.join(binFolderPath, fileName));
      }
    }
  }
}

/**
 * The macOS distribution ships universal binaries, keeping only the slice of the target architecture halves its size.
 * The code signature of a slice is preserved when extracting it.
 *
 * @param {string} folderPath
 * @param {string} arch x64 or arm64
 */
async function thinMacOsBinaries(folderPath, arch) {
  if (process.platform !== 'darwin') {
    throw new Error('macOS binaries can only be thinned on macOS');
  }

  const lipoArch = arch === 'x64' ? 'x86_64' : 'arm64';
  const fatMagic = Buffer.from([0xca, 0xfe, 0xba, 0xbe]);

  /**
   * @param {string} currentFolderPath
   */
  async function walk(currentFolderPath) {
    for (const entry of await fs.readdir(currentFolderPath, { withFileTypes: true })) {
      const entryPath = path.join(currentFolderPath, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile()) {
        const fd = await fs.open(entryPath, 'r');
        const header = Buffer.alloc(4);
        try {
          await fs.read(fd, header, 0, 4, 0);
        } finally {
          await fs.close(fd);
        }
        if (!header.equals(fatMagic)) {
          continue;
        }

        const thinPath = `${entryPath}.thin`;
        const result = spawnSync('lipo', [entryPath, '-thin', lipoArch, '-output', thinPath], { stdio: 'inherit' });
        if (result.status !== 0) {
          throw new Error(`Failed to extract the ${lipoArch} slice of ${entryPath}`);
        }
        await fs.move(thinPath, entryPath, { overwrite: true });
      }
    }
  }

  await walk(folderPath);
}

/**
 * Installs the PostgreSQL server binaries used by the embedded database in static/postgres.
 * They come from the @embedded-postgres npm packages (one per platform), downloaded from the npm registry rather
 * than installed as dependencies because packaging the app for another platform must be possible.
 *
 * @param {NodeJS.Platform} platform
 * @param {string} arch
 */
export async function installEmbeddedPostgreSql(platform = process.platform, arch = process.arch) {
  const packageNames = {
    'darwin-x64': 'darwin-x64',
    'darwin-arm64': 'darwin-arm64',
    'linux-x64': 'linux-x64',
    'linux-arm64': 'linux-arm64',
    'win32-x64': 'windows-x64',
  };
  const platformKey = `${platform}-${arch}`;
  const packageName = packageNames[platformKey];
  if (packageName === undefined) {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }

  const version = EMBEDDED_POSTGRESQL_PACKAGE_VERSION;
  const installationId = `${packageName}-${version}`;
  const destinationPath = path.join(staticFolderPath, 'postgres');
  // Written last, its presence means the folder is complete and up to date.
  const markerFilePath = path.join(destinationPath, 'VERSION');
  if ((await fs.pathExists(markerFilePath)) && (await fs.readFile(markerFilePath, 'utf8')) === installationId) {
    return;
  }

  const cacheFolderPath = path.join(projectPath, 'node_modules', '.cache', 'embedded-postgres');
  await fs.ensureDir(cacheFolderPath);
  const archivePath = path.join(cacheFolderPath, `${installationId}.tgz`);
  if (!(await fs.pathExists(archivePath))) {
    const url = `https://registry.npmjs.org/@embedded-postgres/${packageName}/-/${packageName}-${version}.tgz`;
    await downloadFile(url, archivePath);
  }

  const extractionPath = path.join(cacheFolderPath, installationId);
  await fs.remove(extractionPath);
  await fs.ensureDir(extractionPath);
  // Only the "native" folder of the package is needed, it contains the bin, lib and share folders.
  // tar is available on every supported platform, including Windows 10+.
  // Paths are relative to the cache folder because GNU tar (e.g. the one shipped with Git for Windows) interprets
  // the colon of an absolute Windows path such as C:\... as a remote host.
  const result = spawnSync(
    'tar',
    ['-xzf', path.basename(archivePath), '-C', installationId, '--strip-components=2', 'package/native'],
    { cwd: cacheFolderPath, stdio: 'inherit' },
  );
  if (result.status !== 0) {
    throw new Error(`Failed to extract ${archivePath}`);
  }

  await hydrateSymbolicLinks(extractionPath);
  await removeUnusedPostgreSqlFiles(extractionPath, platform);
  if (platform === 'darwin') {
    await thinMacOsBinaries(extractionPath, arch);
  }

  await fs.remove(destinationPath);
  await fs.move(extractionPath, destinationPath);
  await fs.writeFile(markerFilePath, installationId);
}
