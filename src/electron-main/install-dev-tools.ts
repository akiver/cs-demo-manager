import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from '@tomjs/electron-devtools-installer';

export async function installDevTools() {
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];

  return Promise.all(
    extensions.map((name) => installExtension(name, { loadExtensionOptions: { allowFileAccess: true } })),
  ).catch((error) => {
    logger.warn('Failed to install DevTools extension', error);
  });
}
