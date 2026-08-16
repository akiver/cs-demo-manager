import path from 'node:path';
import crypto from 'node:crypto';
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

async function downloadChecksum(url) {
  const response = await fetch(url);
  // ! Without this check the body of an error page becomes the expected checksum, and a perfectly
  // valid archive is then reported as a checksum mismatch instead of the network failure it is.
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  return (await response.text()).trim().toLowerCase();
}

async function hashFile(filePath) {
  return crypto
    .createHash('sha1')
    .update(await fs.readFile(filePath))
    .digest('hex');
}

async function downloadPostgresArchive(artifact) {
  const fileName = `embedded-postgres-binaries-${artifact}-${POSTGRES_VERSION}.jar`;
  const url = `https://repo1.maven.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-${artifact}/${POSTGRES_VERSION}/${fileName}`;
  const cacheFolderPath = path.join(projectPath, 'node_modules/.cache/postgres');
  const archivePath = path.join(cacheFolderPath, fileName);
  // The checksum of a verified download is kept next to the archive so that reusing it doesn't
  // require Maven Central, otherwise every install would need the network to do nothing.
  const checksumPath = `${archivePath}.sha1`;

  const isArchiveValid = async (expectedChecksum) => {
    if (expectedChecksum === undefined || !(await fs.pathExists(archivePath))) {
      return false;
    }

    return (await hashFile(archivePath)) === expectedChecksum;
  };

  const cachedChecksum = (await fs.pathExists(checksumPath))
    ? (await fs.readFile(checksumPath, 'utf8')).trim()
    : undefined;
  if (await isArchiveValid(cachedChecksum)) {
    return archivePath;
  }

  const expectedChecksum = await downloadChecksum(`${url}.sha1`);
  if (!(await isArchiveValid(expectedChecksum))) {
    await downloadFile(url, archivePath);
    if ((await hashFile(archivePath)) !== expectedChecksum) {
      throw new Error(`Checksum mismatch for ${fileName}`);
    }
  }

  await fs.writeFile(checksumPath, expectedChecksum);

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

  const tarballPath = `${archivePath}.txz`;
  await pipeline(entry.stream(), fs.createWriteStream(tarballPath));

  await fs.emptyDir(destinationFolderPath);
  // bsdtar (macOS, Windows 10+) and GNU tar (Linux) both handle xz through -xf.
  await execFileAsync('tar', ['-xf', tarballPath, '-C', destinationFolderPath]);
  await fs.remove(tarballPath);
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

// The macOS binaries published by EDB are universal, keeping both slices would double the app size.
async function thinMacOsBinaries(folderPath, arch) {
  const machoArch = arch === 'arm64' ? 'arm64' : 'x86_64';
  const filePaths = [
    ...(await listFilesRecursively(path.join(folderPath, 'bin'))),
    ...(await listFilesRecursively(path.join(folderPath, 'lib'))),
  ];

  for (const filePath of filePaths) {
    let stdout;
    try {
      ({ stdout } = await execFileAsync('lipo', ['-info', filePath]));
    } catch {
      // Not a Mach-O file, nothing to thin.
      continue;
    }

    if (!stdout.includes('Architectures in the fat file')) {
      continue;
    }

    try {
      await execFileAsync('lipo', ['-thin', machoArch, '-output', filePath, filePath]);
    } catch (error) {
      // The file stays universal, which only costs size. Silence would hide a binary shipped without
      // the architecture being packaged.
      console.warn(`Failed to thin ${filePath} to ${machoArch}: ${error.message}`);
    }
  }
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

export async function installPostgres(platform = process.platform, arch = process.arch) {
  const platformKey = `${platform}-${arch}`;
  const artifact = POSTGRES_MAVEN_ARTIFACTS[platformKey];
  if (artifact === undefined) {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }

  const archivePath = await downloadPostgresArchive(artifact);
  const destinationPath = path.join(staticFolderPath, 'postgres');
  await extractPostgresArchive(archivePath, destinationPath);
  await prunePostgresFolder(destinationPath, platform);

  if (platform === 'darwin') {
    await thinMacOsBinaries(destinationPath, arch);
  }

  if (platform !== 'win32') {
    await makePostgresBinariesExecutable(destinationPath);
  }

  await fs.writeFile(path.join(destinationPath, 'VERSION'), POSTGRES_VERSION);
}
