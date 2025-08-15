import type { Settings } from 'csdm/node/settings/settings';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { settingsUpdated } from './settings-actions';
import type { UpdateSettingsOptions } from 'csdm/node/settings/update-settings';

export function useUpdateSettings() {
  const dispatch = useDispatch();

  const updateSettings = async (partialSettings: DeepPartial<Settings>, options?: UpdateSettingsOptions) => {
    const newSettings = await window.csdm.updateSettings(partialSettings, options);
    dispatch(
      settingsUpdated({
        settings: newSettings,
      }),
    );
  };

  return updateSettings;
}
