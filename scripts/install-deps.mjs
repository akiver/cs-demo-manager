import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream/promises';
import fs from 'fs-extra';
import unzipper from 'unzipper';

const execFileAsync = promisify(execFile);
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
 * PostgreSQL major version of the embedded cluster.
 * ! Bumping the major version makes existing data folders unreadable, it requires a data migration.
 * The cluster's PG_VERSION file is checked against this value at startup, see initialize-cluster.ts.
 */
export const POSTGRES_VERSION = '17.10.0';

// Prebuilt PostgreSQL binaries published on Maven Central by the zonky project.
// They contain only "initdb", "pg_ctl" and "postgres", which is everything the app needs since
// matches are inserted with the COPY protocol instead of the psql CLI.
const POSTGRES_MAVEN_ARTIFACTS = {
  'win32-x64': 'windows-amd64',
  'darwin-x64': 'darwin-amd64',
  'darwin-arm64': 'darwin-arm64v8',
  'linux-x64': 'linux-amd64',
};

async function downloadFile(url, destinationPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  await fs.ensureDir(path.dirname(destinationPath));
  await pipeline(response.body, fs.createWriteStream(destinationPath));
}

async function downloadPostgresArchive(artifact) {
  const fileName = `embedded-postgres-binaries-${artifact}-${POSTGRES_VERSION}.jar`;
  const url = `https://repo1.maven.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-${artifact}/${POSTGRES_VERSION}/${fileName}`;
  const cacheFolderPath = path.join(projectPath, 'node_modules/.cache/postgres');
  const archivePath = path.join(cacheFolderPath, fileName);
  if (await fs.pathExists(archivePath)) {
    return archivePath;
  }

  // ! Written next to its destination and renamed once complete. A connection dropped mid-transfer
  // would otherwise leave a truncated .jar in the cache, and every later install would fail on it
  // with an unrelated "Error FILE_ENDED" until it is deleted by hand.
  const temporaryPath = `${archivePath}.tmp`;
  await downloadFile(url, temporaryPath);
  await fs.move(temporaryPath, archivePath, { overwrite: true });

  return archivePath;
}

async function extractPostgresArchive(archivePath, destinationFolderPath) {
  // The .jar is a ZIP that contains a single .txz archive holding the bin/lib/share folders.
  const directory = await unzipper.Open.file(archivePath);
  const entry = directory.files.find((file) => {
    return file.path.endsWith('.txz');
  });
  if (entry === undefined) {
    throw new Error(`No .txz entry found in ${archivePath}`);
  }

  const tarballFileName = 'postgres.txz';

  try {
    await fs.emptyDir(destinationFolderPath);
    await pipeline(entry.stream(), fs.createWriteStream(path.join(destinationFolderPath, tarballFileName)));

    // ! The tarball is passed by name, relative to cwd, never as an absolute path: GNU tar, the one
    // Git for Windows ships and puts first in the PATH of its shell, reads "C:\..." as the
    // "host:path" syntax of a remote archive and fails with "Cannot connect to C".
    // bsdtar (Windows 10+, macOS) and GNU tar (Linux) both handle xz through -xf.
    await execFileAsync('tar', ['-xf', tarballFileName], { cwd: destinationFolderPath });
  } finally {
    await fs.remove(path.join(destinationFolderPath, tarballFileName));
  }
}

async function prunePostgresFolder(folderPath, platform) {
  const foldersToRemove = [
    'doc',
    'include',
    'share/doc',
    'share/man',
    // Translated server messages. The app forces LC_MESSAGES=C so the cluster logs stay in English.
    'share/locale',
    'lib/pkgconfig',
  ];
  await Promise.all(
    foldersToRemove.map((folder) => {
      return fs.remove(path.join(folderPath, folder));
    }),
  );

  const libFolderPath = path.join(folderPath, 'lib');
  if (await fs.pathExists(libFolderPath)) {
    const libFiles = await fs.readdir(libFolderPath);
    await Promise.all(
      libFiles
        .filter((file) => {
          return file.endsWith('.a') || file.endsWith('.lib');
        })
        .map((file) => {
          return fs.remove(path.join(libFolderPath, file));
        }),
    );
  }

  if (platform === 'win32') {
    // wxWidgets is only used by EDB's StackBuilder GUI and testplug is a regression test module.
    const binFolderPath = path.join(folderPath, 'bin');
    const binFiles = await fs.readdir(binFolderPath);
    await Promise.all(
      binFiles
        .filter((file) => {
          return file.startsWith('wx') || file === 'testplug.dll';
        })
        .map((file) => {
          return fs.remove(path.join(binFolderPath, file));
        }),
    );
  }
}

async function listFilesRecursively(folderPath) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(folderPath, entry.name);
      return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
    }),
  );

  return files.flat();
}

async function makePostgresBinariesExecutable(folderPath) {
  const filePaths = [
    ...(await listFilesRecursively(path.join(folderPath, 'bin'))),
    ...(await listFilesRecursively(path.join(folderPath, 'lib'))),
  ];

  // The execute bit must be set at packaging time: AppImage mounts its content read-only.
  await Promise.all(
    filePaths.map((filePath) => {
      return fs.chmod(filePath, 0o755);
    }),
  );
}

async function removeFolderBestEffort(folderPath) {
  try {
    await fs.remove(folderPath);
  } catch (error) {
    console.warn(`Failed to remove the previous PostgreSQL binaries in ${folderPath}: ${error.message}`);
  }
}

/**
 * The binaries are extracted aside and only then moved into place, so that a failed extraction
 * cannot leave static/postgres empty. The previous copy is kept until the move succeeded.
 */
async function swapPostgresFolder(stagingFolderPath, destinationFolderPath, backupFolderPath) {
  if (await fs.pathExists(destinationFolderPath)) {
    await fs.move(destinationFolderPath, backupFolderPath);
  }

  try {
    await fs.move(stagingFolderPath, destinationFolderPath);
  } catch (error) {
    if ((await fs.pathExists(backupFolderPath)) && !(await fs.pathExists(destinationFolderPath))) {
      await fs.move(backupFolderPath, destinationFolderPath);
    }

    throw error;
  }

  await removeFolderBestEffort(backupFolderPath);
}

export async function installPostgres(platform = process.platform, arch = process.arch) {
  const platformKey = `${platform}-${arch}`;
  const artifact = POSTGRES_MAVEN_ARTIFACTS[platformKey];
  if (artifact === undefined) {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }

  const cacheFolderPath = path.join(projectPath, 'node_modules/.cache/postgres');
  const archivePath = await downloadPostgresArchive(artifact);
  const destinationPath = path.join(staticFolderPath, 'postgres');
  const stagingFolderPath = path.join(cacheFolderPath, `extract-${platformKey}`);
  const backupFolderPath = path.join(cacheFolderPath, `previous-${platformKey}`);

  try {
    await removeFolderBestEffort(backupFolderPath);
    await extractPostgresArchive(archivePath, stagingFolderPath);
    await prunePostgresFolder(stagingFolderPath, platform);

    if (platform !== 'win32') {
      await makePostgresBinariesExecutable(stagingFolderPath);
    }

    await fs.writeFile(path.join(stagingFolderPath, 'VERSION'), POSTGRES_VERSION);
    await swapPostgresFolder(stagingFolderPath, destinationPath, backupFolderPath);
  } finally {
    await removeFolderBestEffort(stagingFolderPath);
  }
}
