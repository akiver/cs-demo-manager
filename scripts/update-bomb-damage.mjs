// Regenerates the bomb damage data files shipped with the app (static/maps/cs2/bomb-damage/*.json.gz) from the
// maps of the local CS2 install. To run after a CS2 update that changed the official defusal maps.
//
// For each CS2 defusal map known by the app, it extracts and decompiles maps/<map>/baked_bomb_damage.vdata
// from game/csgo/maps/<map>.vpk with the Source2Viewer CLI, then converts it to the app format.
// Maps without baked data (not updated by Valve yet, or not defusal) are skipped.
//
// Usage:
//   node scripts/update-bomb-damage.mjs [options]
//
// Options:
//   --maps <names>        Comma-separated map names to process, defaults to all CS2 de_* maps in default-maps.mts.
//   --cs2-folder <path>   CS2 install folder ("Counter-Strike Global Offensive"), auto-detected from Steam otherwise.
//   --cli <path>          Path to the Source2Viewer-CLI executable. Defaults to the SOURCE2VIEWER_CLI env variable,
//                         otherwise the latest release is downloaded into node_modules/.cache/source2viewer-cli.
//   --keep                Keep the decompiled .vdata files (written next to the generated files).
//   --network-protocol <n>  Network protocol of the current CS2 version (the "network_protocol" of a demo recorded
//                         with it), read from the PatchVersion of game/csgo/steam.inf by default.
//                         It's stored in the data of maps that get baked data for the first time: demos older than
//                         this protocol are drawn with the legacy radial model. Maps that already have a data file
//                         keep their protocol when their data is refreshed.
//                         The maps baked by the July 9, 2026 update use 14168.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathExists } from 'fs-extra';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { Game } from '@akiver/cs-demo-analyzer';
import { getDefaultMaps } from '../src/node/database/maps/default-maps.mts';
import { getCsgoFolderPath } from '../src/node/counter-strike/steam-folders.mts';
import {
  buildMapBombDamage,
  describeParsedData,
  findSiteLetters,
  getMapBombDamageOutputPath,
  parseBakedBombDamage,
  parseBombTargets,
  writeMapBombDamage,
} from './baked-bomb-damage.mjs';

// Used by the app modules imported from src/.
globalThis.logger = console;

const execFileAsync = promisify(execFile);
const rootFolderPath = fileURLToPath(new URL('..', import.meta.url));
const GAME = 'cs2';
const CLI_RELEASES_URL = 'https://api.github.com/repos/ValveResourceFormat/ValveResourceFormat/releases/latest';
const SUPPORTED_SOURCE_VERSIONS = [1, 2];

function parseArguments(argv) {
  const options = {
    maps: undefined,
    cs2Folder: undefined,
    cli: process.env.SOURCE2VIEWER_CLI,
    keep: false,
    networkProtocol: undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--network-protocol':
        options.networkProtocol = Number(argv[++i]);
        if (!Number.isInteger(options.networkProtocol) || options.networkProtocol <= 0) {
          console.error(`Invalid network protocol ${argv[i]}`);
          process.exit(1);
        }
        break;
      case '--maps':
        options.maps = argv[++i].split(',').map((name) => name.trim());
        break;
      case '--cs2-folder':
        options.cs2Folder = argv[++i];
        break;
      case '--cli':
        options.cli = argv[++i];
        break;
      case '--keep':
        options.keep = true;
        break;
      default:
        console.error(`Unknown argument ${argv[i]}`);
        process.exit(1);
    }
  }

  return options;
}

/**
 * Reads the CS2 defusal maps and their lower level threshold from the app default maps.
 */
function getDefaultDefusalMaps() {
  return new Map(
    getDefaultMaps(Game.CS2)
      .filter((map) => map.name.startsWith('de_'))
      .map((map) => [map.name, { thresholdZ: map.threshold_z }]),
  );
}

async function hasLowerRadar(mapName) {
  return pathExists(path.join(rootFolderPath, 'static', 'images', 'maps', GAME, 'radars', `${mapName}_lower.png`));
}

/**
 * Returns the network protocol of the installed CS2 version, it's the steam.inf PatchVersion without the dots, e.g.
 * PatchVersion=1.41.9.6 is the network protocol 14196.
 */
async function readCs2NetworkProtocol(cs2FolderPath) {
  const steamInfPath = path.join(cs2FolderPath, 'game', 'csgo', 'steam.inf');
  if (!(await pathExists(steamInfPath))) {
    return undefined;
  }

  const content = await fs.readFile(steamInfPath, 'utf8');
  const match = content.match(/^PatchVersion=([\d.]+)\s*$/m);
  if (!match) {
    return undefined;
  }

  const networkProtocol = Number(match[1].replaceAll('.', ''));

  return Number.isInteger(networkProtocol) && networkProtocol > 0 ? networkProtocol : undefined;
}

function getCliAssetName() {
  const platform = { win32: 'windows', darwin: 'macos', linux: 'linux' }[process.platform];
  const arch = { x64: 'x64', arm64: 'arm64', arm: 'arm' }[process.arch];
  if (!platform || !arch) {
    throw new Error(`Unsupported platform ${process.platform} ${process.arch}`);
  }

  return `cli-${platform}-${arch}.zip`;
}

function getCliExecutableName() {
  return process.platform === 'win32' ? 'Source2Viewer-CLI.exe' : 'Source2Viewer-CLI';
}

/**
 * Downloads the latest Source2Viewer CLI release into node_modules/.cache unless it's already there.
 */
async function downloadCli() {
  console.log('Looking up the latest Source2Viewer CLI release…');
  const response = await fetch(CLI_RELEASES_URL, { headers: { 'User-Agent': 'cs-demo-manager' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch the latest Source2Viewer release: ${response.status} ${response.statusText}`);
  }
  const release = await response.json();
  const assetName = getCliAssetName();
  const asset = release.assets.find((asset) => asset.name === assetName);
  if (!asset) {
    throw new Error(`Asset ${assetName} not found in Source2Viewer release ${release.tag_name}`);
  }

  const cacheFolderPath = path.join(rootFolderPath, 'node_modules', '.cache', 'source2viewer-cli', release.tag_name);
  const executablePath = path.join(cacheFolderPath, getCliExecutableName());
  if (await pathExists(executablePath)) {
    return executablePath;
  }

  console.log(`Downloading Source2Viewer CLI ${release.tag_name} (${asset.browser_download_url})…`);
  await fs.mkdir(cacheFolderPath, { recursive: true });
  const zipPath = path.join(cacheFolderPath, assetName);
  const download = await fetch(asset.browser_download_url);
  if (!download.ok) {
    throw new Error(`Failed to download ${asset.browser_download_url}: ${download.status}`);
  }
  await fs.writeFile(zipPath, Buffer.from(await download.arrayBuffer()));
  // tar handles zip archives on Windows 10+, macOS and most Linux distributions.
  // On Windows, use the system bsdtar explicitly: the GNU tar from Git for Windows may come first in the PATH, it
  // doesn't read zip files and treats "C:" as a remote host. The archive path is relative to the cwd for the same reason.
  const tarPath =
    process.platform === 'win32' ? path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
  await execFileAsync(tarPath, ['-xf', assetName], { cwd: cacheFolderPath });
  await fs.rm(zipPath);
  if (process.platform !== 'win32') {
    await fs.chmod(executablePath, 0o755);
  }
  if (!(await pathExists(executablePath))) {
    throw new Error(`${getCliExecutableName()} not found in ${cacheFolderPath} after extraction`);
  }

  return executablePath;
}

async function resolveCli(cliOption) {
  if (cliOption) {
    if (!(await pathExists(cliOption))) {
      throw new Error(`Source2Viewer CLI not found at ${cliOption}`);
    }
    return cliOption;
  }

  return downloadCli();
}

async function exportVpkFile(cliPath, vpkPath, internalPath, decompiledExtension, outputFolderPath) {
  await execFileAsync(cliPath, ['-i', vpkPath, '-o', outputFolderPath, '-d', '-f', internalPath], {
    maxBuffer: 64 * 1024 * 1024,
  });

  const filePath = path.join(outputFolderPath, `${internalPath}.${decompiledExtension}`);

  return (await pathExists(filePath)) ? filePath : undefined;
}

async function readSiteLetters(cliPath, vpkPath, mapName, outputFolderPath, sites) {
  const internalPath = `maps/${mapName}/entities/default_ents`;
  const entitiesPath = await exportVpkFile(cliPath, vpkPath, internalPath, 'vents', outputFolderPath);
  if (!entitiesPath) {
    throw new Error(`${mapName}: ${internalPath} not found in ${vpkPath}`);
  }

  try {
    return findSiteLetters(sites, parseBombTargets(await fs.readFile(entitiesPath, 'utf8')));
  } catch (error) {
    throw new Error(`${mapName}: unable to find the site letters`, { cause: error });
  }
}

async function readExistingData(outputPath) {
  if (!(await pathExists(outputPath))) {
    return undefined;
  }

  try {
    const content = await fs.readFile(outputPath);
    const json = gunzipSync(content).toString('utf8');
    const { minNetworkProtocol } = JSON.parse(json);
    return { json, minNetworkProtocol };
  } catch {
    return undefined;
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  const cs2FolderPath = options.cs2Folder ?? (await getCsgoFolderPath(Game.CS2));
  if (!cs2FolderPath || !(await pathExists(cs2FolderPath))) {
    throw new Error('CS2 install folder not found, use --cs2-folder <path>');
  }
  const mapsFolderPath = path.join(cs2FolderPath, 'game', 'csgo', 'maps');
  console.log(`CS2 maps folder: ${mapsFolderPath}`);
  const networkProtocol = options.networkProtocol ?? (await readCs2NetworkProtocol(cs2FolderPath));
  console.log(`CS2 network protocol: ${networkProtocol ?? 'unknown, use --network-protocol <n>'}`);

  const defaultMaps = getDefaultDefusalMaps();
  const mapNames = options.maps ?? [...defaultMaps.keys()];
  const cliPath = await resolveCli(options.cli);
  console.log(`Source2Viewer CLI: ${cliPath}`);

  const workFolderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'csdm-bomb-damage-'));
  const results = [];
  try {
    for (const mapName of mapNames) {
      const vpkPath = path.join(mapsFolderPath, `${mapName}.vpk`);
      if (!(await pathExists(vpkPath))) {
        results.push({ mapName, status: 'vpk not found' });
        continue;
      }

      console.log(`\n${mapName}: extracting baked data from ${vpkPath}…`);
      const vdataPath = await exportVpkFile(
        cliPath,
        vpkPath,
        `maps/${mapName}/baked_bomb_damage`,
        'vdata',
        workFolderPath,
      );
      if (!vdataPath) {
        results.push({ mapName, status: 'no baked data' });
        continue;
      }

      const parsed = parseBakedBombDamage(await fs.readFile(vdataPath));
      if (!SUPPORTED_SOURCE_VERSIONS.includes(parsed.sourceVersion)) {
        console.warn(
          `  Warning: source version ${parsed.sourceVersion}, expected ${SUPPORTED_SOURCE_VERSIONS.join(' or ')}`,
        );
      }
      console.log(`  ${describeParsedData(parsed)}`);
      const siteLetters = await readSiteLetters(cliPath, vpkPath, mapName, workFolderPath, parsed.sites);
      console.log(`  Site letters: ${siteLetters.join(', ')}`);

      const outputPath = getMapBombDamageOutputPath(rootFolderPath, GAME, mapName);
      const existingData = await readExistingData(outputPath);
      if (options.keep) {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.copyFile(vdataPath, path.join(path.dirname(outputPath), `${mapName}.vdata`));
      }

      // Keep the protocol of the update that baked the map data for the first time, demos recorded before a refresh
      // of the data still used baked damage.
      const minNetworkProtocol = existingData?.minNetworkProtocol ?? networkProtocol;
      if (minNetworkProtocol === undefined) {
        console.warn('  New baked data, the current network protocol is unknown (--network-protocol <n>)');
        results.push({ mapName, status: 'unknown network protocol' });
        continue;
      }

      const thresholdZ = (await hasLowerRadar(mapName)) ? defaultMaps.get(mapName)?.thresholdZ : undefined;
      if (thresholdZ !== undefined) {
        console.log(`  Splitting levels at Z ${thresholdZ}`);
      }
      const data = buildMapBombDamage(parsed, { minNetworkProtocol, thresholdZ, siteLetters });
      // Compare the whole output rather than the source hash only, the conversion code, the output version or the map
      // threshold may have changed since the file was generated.
      if (existingData?.json === JSON.stringify(data)) {
        results.push({ mapName, status: 'unchanged' });
        continue;
      }

      const size = await writeMapBombDamage(data, outputPath);
      results.push({ mapName, status: existingData ? 'updated' : 'created', size: `${Math.round(size / 1024)} KB` });
    }
  } finally {
    await fs.rm(workFolderPath, { recursive: true, force: true });
  }

  console.log('');
  console.table(results);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
