import type { Settings } from 'csdm/node/settings/settings';
import type { UpdateSettingsOptions } from 'csdm/node/settings/update-settings';
import { updateSettings } from 'csdm/node/settings/update-settings';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';

export async function updateSettingsAndNotifyRendererProcess(
  partialSettings: DeepPartial<Settings>,
  options?: UpdateSettingsOptions,
) {
  const newSettings = await updateSettings(partialSettings, options);
  server.sendMessageToRendererProcess({
    name: RendererServerMessageName.SettingsUpdated,
    payload: newSettings,
  });
}
