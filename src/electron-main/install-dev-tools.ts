import { installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

export async function installDevTools() {
  try {
    // ! Need to do a CTRL/CMD+R to actually see the React DevTools.
    // TODO deps Remove this note once the following issue is resolved.
    // https://github.com/electron/electron/issues/41613
    await installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]);
  } catch (error) {
    logger.warn('Failed to install DevTools extension');
    logger.error(error);
  }
}
