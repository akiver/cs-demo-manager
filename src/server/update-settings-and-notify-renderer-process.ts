import type { Settings } from 'csdm/node/settings/settings';
import type { UpdateSettingsOptions } from 'csdm/node/settings/update-settings';
import { updateSettings } from 'csdm/node/settings/update-settings';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { server } from 'csdm/server/server';

export async function updateSettingsAndNotifyRendererProcess(
  partialSettings: DeepPartial<Settings>,
  options?: UpdateSettingsOptions,
) {
  const newSettings = await updateSettings(partialSettings, options);
  server.sendPushMessage({
    name: ServerPushMessageName.SettingsUpdated,
    payload: newSettings,
  });
}
