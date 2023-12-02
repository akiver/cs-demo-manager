import React, { useState, type ReactNode } from 'react';
import { Trans, msg } from '@lingui/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useUpdateSettings } from '../use-update-settings';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ApplyButton } from 'csdm/ui/components/buttons/apply-button';
import { ResetButton } from 'csdm/ui/components/buttons/reset-button';
import { useSettings } from '../use-settings';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function SteamAPIKey() {
  const showToast = useShowToast();
  const _ = useI18n();
  const { steamApiKey: currentSteamApiKey } = useSettings();
  const [apiKey, setApiKey] = useState(currentSteamApiKey);
  const updateSettings = useUpdateSettings();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const showError = (error: ReactNode) => {
    showToast({
      id: 'steam-api-key-error',
      content: error,
      type: 'error',
    });
  };

  const testApiKey = async () => {
    if (apiKey === '' || currentSteamApiKey === apiKey) {
      return;
    }

    try {
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=[]`,
      );
      if (response.status === 200) {
        await updateSettings({
          steamApiKey: apiKey,
        });
        showToast({
          content: <Trans>API key applied</Trans>,
          id: 'update-steam-api-key',
          type: 'success',
        });
      } else {
        showError(<Trans>Invalid API key</Trans>);
      }
    } catch (error) {
      showError(<Trans>Network error</Trans>);
    }
  };

  const resetApiKey = async () => {
    await updateSettings({
      steamApiKey: '',
    });
    setApiKey('');
  };

  return (
    <div className="flex items-center gap-x-8 max-w-[524px]">
      <TextInput
        value={apiKey}
        onChange={onChange}
        onEnterKeyDown={testApiKey}
        placeholder={_(
          msg({
            context: 'Input placeholder',
            message: 'API key',
          }),
        )}
      />
      <ApplyButton onClick={testApiKey} isDisabled={apiKey === '' || currentSteamApiKey === apiKey} />
      <ResetButton onClick={resetApiKey} />
    </div>
  );
}
