import path from 'node:path';
import fs from 'fs-extra';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { getCsgoFolderPathOrThrow } from '../get-csgo-folder-path';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';
import { isLinux } from 'csdm/node/os/is-linux';
import { getSettings } from 'csdm/node/settings/get-settings';
import { CS2PluginVersion } from 'csdm/common/types/cs2-plugin-version';

// On Linux, CS2 renders through Vulkan and the in-game overlay can only be drawn from a Vulkan layer: the game resolves
// its Vulkan functions into its own table at startup, before the plugin is loaded, so there is nothing for the plugin
// to hook (on Windows it patches the Direct3D swap chain). See cs2-server-plugin/cs2-server-plugin/vulkan-layer/.
const VULKAN_LAYER_NAME = 'VK_LAYER_csdm_overlay';
const VULKAN_LAYER_LIBRARY_NAME = 'libcsdm_vulkan_layer.so';
const VULKAN_LAYER_MANIFEST_NAME = 'csdm_overlay.json';
// The layer is installed as an implicit layer because CS2 (rendersystemvulkan) crashes on startup on some
// driver/runtime combinations when an explicit layer is inserted in the chain. Implicit layers, which the Steam overlay
// use, work. The loader enables an implicit layer found on its search path, and the app only adds this folder to it
// when it starts CS (see getCs2VulkanLayerEnv). This variable also gates the layer so it stays off if the folder ends
// up on the path some other way.
const VULKAN_LAYER_ENABLE_ENV_NAME = 'ENABLE_CSDM_OVERLAY';
// The Vulkan loader skips an implicit layer that doesn't declare a disable_environment, even one gated behind an
// enable_environment. Nothing sets this variable.
const VULKAN_LAYER_DISABLE_ENV_NAME = 'DISABLE_CSDM_OVERLAY';

function getGameInfoFilePathFromGamePath(executablePath: string) {
  return path.join(executablePath, 'game', 'csgo', 'gameinfo.gi');
}

function getServerPluginFolderFromGamePath(executablePath: string) {
  return path.join(executablePath, 'game', 'csgo', 'csdm');
}

// Must match VULKAN_LAYER_LIB_PATH in overlay_linux.cpp.
function getVulkanLayerFolderFromGamePath(executablePath: string) {
  return path.join(getServerPluginFolderFromGamePath(executablePath), 'vulkan');
}

function getLogFolderFromGamePath(csgoFolderPath: string) {
  return path.join(csgoFolderPath, 'game', 'bin', isWindows ? 'win64' : 'linuxsteamrt64');
}

async function deleteLogFiles(csgoFolderPath: string) {
  const logFolderPath = getLogFolderFromGamePath(csgoFolderPath);

  // Must match the file names used in the plugin (log.cpp) and the layer (vulkan-layer/log.cpp).
  await Promise.all(['csdm.log', 'csdm-vulkan.log'].map((fileName) => fs.remove(path.join(logFolderPath, fileName))));
}

async function getSelectedPluginVersion() {
  const settings = await getSettings();

  return settings.playback.cs2PluginVersion ?? CS2PluginVersion.latest;
}

function getBundledBinaryName(version: string) {
  if (version !== CS2PluginVersion.latest) {
    return isWindows ? `server_${version}.dll` : `libserver_${version}.so`;
  }

  return isWindows ? 'server.dll' : 'libserver.so';
}

// A plugin binary only works with the layer it was built with: dlsym checks the exports exist but not the layout of
// the structs passed to them. The layer is frozen with the plugin, versions that predate the layer have none.
function getBundledVulkanLayerName(version: string) {
  return version === CS2PluginVersion.latest ? VULKAN_LAYER_LIBRARY_NAME : `libcsdm_vulkan_layer_${version}.so`;
}

function getBundledVulkanLayerPath(version: string) {
  return path.join(getStaticFolderPath(), 'cs2', getBundledVulkanLayerName(version));
}

// The layer library and its manifest go in the plugin folder, which the uninstall removes, so nothing is left behind
// in the game installation.
async function installCs2VulkanLayer(csgoFolderPath: string, version: string) {
  const layerFolderPath = getVulkanLayerFolderFromGamePath(csgoFolderPath);
  const layerSourcePath = getBundledVulkanLayerPath(version);
  const layerExists = await fs.pathExists(layerSourcePath);
  if (!layerExists) {
    await fs.remove(layerFolderPath);
    if (version === CS2PluginVersion.latest) {
      logger.warn(`The CS2 Vulkan layer ${VULKAN_LAYER_LIBRARY_NAME} is missing, the in-game panels won't be drawn`);
    } else {
      logger.debug(`No CS2 Vulkan layer for the plugin version ${version}, the in-game panels won't be drawn`);
    }
    return;
  }

  const manifestFolderPath = path.join(layerFolderPath, 'implicit_layer.d');
  await fs.mkdirp(manifestFolderPath);

  const layerLibraryPath = path.join(layerFolderPath, VULKAN_LAYER_LIBRARY_NAME);
  await fs.copyFile(layerSourcePath, layerLibraryPath);

  const manifest = {
    file_format_version: '1.2.0',
    layer: {
      name: VULKAN_LAYER_NAME,
      type: 'GLOBAL',
      library_path: layerLibraryPath,
      api_version: '1.3.0',
      implementation_version: '1',
      description: 'CS Demo Manager in-game overlay',
      // Activates the layer only when the app sets this variable, see getCs2VulkanLayerEnv.
      enable_environment: {
        [VULKAN_LAYER_ENABLE_ENV_NAME]: '1',
      },
      disable_environment: {
        [VULKAN_LAYER_DISABLE_ENV_NAME]: '1',
      },
    },
  };
  await fs.writeJson(path.join(manifestFolderPath, VULKAN_LAYER_MANIFEST_NAME), manifest, { spaces: 2 });
}

function prependToEnvList(value: string, currentValue: string | undefined) {
  return currentValue ? `${value}:${currentValue}` : value;
}

/**
 * Environment variables for the game process that make the Vulkan loader find and enable the overlay layer. The loader
 * reads them when the game creates its Vulkan instance.
 *
 * Adding the manifest folder to the implicit layer search path and setting the manifest's enable variable is enough
 * to activate the layer. VK_INSTANCE_LAYERS or VK_LOADER_LAYERS_ENABLE would insert it as an explicit layer and crash
 * CS2. VK_ADD_IMPLICIT_LAYER_PATH requires loader 1.3.234 or later, XDG_DATA_DIRS covers the older loaders the Steam
 * Linux Runtime may ship.
 */
export async function getCs2VulkanLayerEnv(): Promise<Record<string, string>> {
  if (!isLinux) {
    return {};
  }

  try {
    const version = await getSelectedPluginVersion();
    const bundledLayerExists = await fs.pathExists(getBundledVulkanLayerPath(version));
    if (!bundledLayerExists) {
      // Nothing to enable, installCs2VulkanLayer already said why.
      return {};
    }

    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CS2);
    const layerFolderPath = getVulkanLayerFolderFromGamePath(csgoFolderPath);
    const manifestPath = path.join(layerFolderPath, 'implicit_layer.d', VULKAN_LAYER_MANIFEST_NAME);
    const manifestExists = await fs.pathExists(manifestPath);
    if (!manifestExists) {
      logger.warn(
        `The CS2 Vulkan layer manifest ${VULKAN_LAYER_MANIFEST_NAME} is missing, the in-game panels won't be drawn`,
      );
      return {};
    }

    return {
      VK_ADD_IMPLICIT_LAYER_PATH: prependToEnvList(path.dirname(manifestPath), process.env.VK_ADD_IMPLICIT_LAYER_PATH),
      // The loader looks for manifests in $XDG_DATA_DIRS/vulkan/implicit_layer.d, so this is the parent of the vulkan
      // folder.
      XDG_DATA_DIRS: prependToEnvList(
        getServerPluginFolderFromGamePath(csgoFolderPath),
        process.env.XDG_DATA_DIRS ?? '/usr/local/share:/usr/share',
      ),
      [VULKAN_LAYER_ENABLE_ENV_NAME]: '1',
      // Logs the layers found and enabled to the game's stderr, which ends up in the app log. "all" is too verbose.
      VK_LOADER_DEBUG: process.env.VK_LOADER_DEBUG ?? 'layer,error',
    };
  } catch (error) {
    logger.error('Building the CS2 Vulkan layer environment failed');
    logger.error(error);

    return {};
  }
}

export async function installCs2ServerPlugin() {
  try {
    logger.debug('Installing CS2 server plugin');

    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CS2);
    const pluginFolder = getServerPluginFolderFromGamePath(csgoFolderPath);
    const binFolderPath = isWindows ? path.join(pluginFolder, 'bin') : path.join(pluginFolder, 'bin', 'linuxsteamrt64');
    await deleteLogFiles(csgoFolderPath);
    await fs.mkdirp(binFolderPath);
    const version = await getSelectedPluginVersion();
    const binaryName = isWindows ? 'server.dll' : 'libserver.so';
    await fs.copyFile(
      path.join(getStaticFolderPath(), 'cs2', getBundledBinaryName(version)),
      path.join(binFolderPath, binaryName),
    );

    if (isLinux) {
      await installCs2VulkanLayer(csgoFolderPath, version);
    }

    const gameInfoFilePath = getGameInfoFilePathFromGamePath(csgoFolderPath);
    const content = await fs.readFile(gameInfoFilePath, 'utf8');
    if (!content.includes('Game\tcsgo/csdm')) {
      await fs.copyFile(gameInfoFilePath, `${gameInfoFilePath}.backup`);
      const newContent = content.replace('Game\tcsgo', 'Game\tcsgo/csdm\n\t\t\tGame\tcsgo');
      await fs.writeFile(gameInfoFilePath, newContent);
    }
  } catch (error) {
    logger.error('Installing CS2 server plugin failed');
    logger.error(error);
  }
}

export async function uninstallCs2ServerPlugin() {
  try {
    logger.debug('Uninstalling CS2 server plugin');
    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CS2);
    const pluginFolder = getServerPluginFolderFromGamePath(csgoFolderPath);
    await fs.remove(pluginFolder);

    const gameInfoFilePath = getGameInfoFilePathFromGamePath(csgoFolderPath);
    const backupFilePath = `${gameInfoFilePath}.backup`;
    const backupFileExists = await fs.pathExists(backupFilePath);
    if (backupFileExists) {
      await fs.copyFile(backupFilePath, gameInfoFilePath);
      await fs.remove(backupFilePath);
    }
  } catch (error) {
    logger.error('Uninstalling CS2 server plugin failed');
    logger.error(error);
  }
}
