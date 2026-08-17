import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { execFileSync } from 'node:child_process';

const projectPath = fileURLToPath(new URL('..', import.meta.url));
const distFolderPath = path.resolve(projectPath, 'dist');

async function findFiles(folderPath, fileName) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const matches = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(folderPath, entry.name);
      if (entry.isDirectory()) {
        return findFiles(entryPath, fileName);
      }

      return entry.name === fileName ? [entryPath] : [];
    }),
  );

  return matches.flat();
}

function getPackagedExecutable(resourcesFolderPath) {
  const applicationFolderPath = path.dirname(resourcesFolderPath);
  if (process.platform === 'win32') {
    return path.join(applicationFolderPath, 'cs-demo-manager.exe');
  }
  if (process.platform === 'linux') {
    return path.join(applicationFolderPath, 'cs-demo-manager');
  }

  return path.join(path.dirname(resourcesFolderPath), 'MacOS', 'CS Demo Manager');
}

const appArchives = await findFiles(distFolderPath, 'app.asar');
if (appArchives.length !== 1) {
  throw new Error(`Expected one packaged app.asar, found ${appArchives.length}`);
}

const appArchivePath = appArchives[0];
const resourcesFolderPath = path.dirname(appArchivePath);
const executablePath = process.env.CSDM_PACKAGED_SMOKE_EXECUTABLE ?? getPackagedExecutable(resourcesFolderPath);
const executableExtension = process.platform === 'win32' ? '.exe' : '';
const postgresFolderPath = path.join(resourcesFolderPath, 'static', 'postgres');
const postgresEnvironment = { ...process.env };
if (process.platform === 'linux') {
  postgresEnvironment.LD_LIBRARY_PATH = [path.join(postgresFolderPath, 'lib'), process.env.LD_LIBRARY_PATH]
    .filter((value) => typeof value === 'string' && value !== '')
    .join(path.delimiter);
}

for (const binaryName of ['postgres', 'initdb', 'pg_ctl']) {
  const binaryPath = path.join(postgresFolderPath, 'bin', `${binaryName}${executableExtension}`);
  await fs.access(binaryPath, process.platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK);
  execFileSync(binaryPath, ['--version'], { env: postgresEnvironment, stdio: 'inherit' });
}

const packagedNodeEnvironment = { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
const nativeAddonPath = path.join(appArchivePath, 'node_modules', 'fs-native-extensions');
execFileSync(
  executablePath,
  [
    '-e',
    "const addon = require(process.argv[1]); if (typeof addon.tryLock !== 'function') process.exit(1); console.log('fs-native-extensions loaded');",
    nativeAddonPath,
  ],
  { env: packagedNodeEnvironment, stdio: 'inherit' },
);

execFileSync(executablePath, [path.join(appArchivePath, 'cli.js')], {
  env: packagedNodeEnvironment,
  stdio: 'inherit',
});
