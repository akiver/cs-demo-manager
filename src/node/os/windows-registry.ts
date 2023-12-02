import type { HKEY } from '@vscode/windows-registry';

type Options = {
  hive?: HKEY;
  path: string;
  name: string;
};

export async function getRegistryStringKey({ hive, path, name }: Options) {
  try {
    const registry = await import('@vscode/windows-registry');
    const data = registry.GetStringRegKey(hive ?? 'HKEY_CURRENT_USER', path, name);

    return data;
  } catch (error) {
    logger.error(error);
    return undefined;
  }
}
