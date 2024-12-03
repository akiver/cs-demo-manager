import React, { useState, type ReactNode } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useUpdateSettings } from '../use-update-settings';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ApplyButton } from 'csdm/ui/components/buttons/apply-button';
import { ResetButton } from 'csdm/ui/components/buttons/reset-button';
import { useSettings } from '../use-settings';

export function FaceitApiKey() {
  const showToast = useShowToast();
  const { t } = useLingui();
  const { faceitApiKey: currentFaceitApiKey } = useSettings();
  const [apiKey, setApiKey] = useState(currentFaceitApiKey);
  const updateSettings = useUpdateSettings();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const showError = (error: ReactNode) => {
    showToast({
      id: 'faceit-api-key-error',
      content: error,
      type: 'error',
    });
  };

  const testApiKey = async () => {
    if (apiKey === '' || currentFaceitApiKey === apiKey) {
      return;
    }

    try {
      const response = await fetch(`https://open.faceit.com/data/v4/players?nickname=AkiVer`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        await updateSettings({
          faceitApiKey: apiKey,
        });
        showToast({
          content: <Trans>API key applied</Trans>,
          id: 'update-faceit-api-key',
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
      faceitApiKey: '',
    });
    setApiKey('');
  };

  return (
    <div className="flex items-center gap-x-8 max-w-[524px]">
      <TextInput
        value={apiKey}
        onChange={onChange}
        onEnterKeyDown={testApiKey}
        placeholder={t({
          context: 'Input placeholder',
          message: 'API key',
        })}
      />
      <ApplyButton onClick={testApiKey} isDisabled={apiKey === '' || currentFaceitApiKey === apiKey} />
      <ResetButton onClick={resetApiKey} />
    </div>
  );
}
