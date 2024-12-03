import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useHlaeSettings } from 'csdm/ui/settings/video/hlae/use-hlae-settings';
import { RevealFileInExplorerButton } from 'csdm/ui/components/buttons/reveal-file-in-explorer-button';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { ErrorCode } from 'csdm/common/error-code';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { hlaeVersionChanged } from '../../settings-actions';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ResetButton } from 'csdm/ui/components/buttons/reset-button';
import { ChangeButton } from 'csdm/ui/components/buttons/change-button';

async function showSelectExecutableDialog() {
  const { filePaths, canceled } = await window.csdm.showOpenDialog({
    filters: [{ extensions: ['exe'], name: 'HLAE.exe' }],
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) {
    return;
  }

  const executablePath = filePaths[0];
  return executablePath;
}

export function HlaeLocation() {
  const { hlaeSettings } = useHlaeSettings();
  const dispatch = useDispatch();
  const { customExecutableLocation, customLocationEnabled } = hlaeSettings;
  const showToast = useShowToast();
  const client = useWebSocketClient();

  const handleError = (error: ReactNode) => {
    showToast({
      id: 'hlae-custom-location-error',
      content: error,
      type: 'error',
    });
  };

  const enableCustomLocation = async (executablePath: string) => {
    try {
      const result = await client.send({
        name: RendererClientMessageName.EnableHlaeCustomLocation,
        payload: executablePath,
      });
      dispatch(hlaeVersionChanged(result));
    } catch (error) {
      let errorMessage = <Trans>An error occurred</Trans>;
      switch (error) {
        case ErrorCode.FileNotFound:
          errorMessage = <Trans>File not found</Trans>;
          break;
        case ErrorCode.InvalidHlaeExecutable:
          errorMessage = <Trans>Invalid HLAE executable</Trans>;
          break;
      }

      handleError(errorMessage);
    }
  };

  const disableCustomLocation = async (clearCustomLocation: boolean) => {
    const result = await client.send({
      name: RendererClientMessageName.DisableHlaeCustomLocation,
      payload: clearCustomLocation,
    });
    dispatch(hlaeVersionChanged(result));
    // Ignore known errors because if one occurs, HLAE will be flagged as not installed.
    if (result.errorCode === ErrorCode.UnknownError) {
      handleError(<Trans>An error occurred</Trans>);
    }
  };

  const onCheckboxChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const shouldEnableCustomLocation = event.target.checked;
    if (shouldEnableCustomLocation) {
      let newExecutablePath: string = customExecutableLocation;
      if (customExecutableLocation === '') {
        const executablePath = await showSelectExecutableDialog();
        if (executablePath === undefined) {
          return;
        }
        newExecutablePath = executablePath;
      }

      enableCustomLocation(newExecutablePath);
    } else {
      const clearCustomLocation = false;
      disableCustomLocation(clearCustomLocation);
    }
  };

  const onChangeClick = async () => {
    const executablePath = await showSelectExecutableDialog();
    if (executablePath === undefined) {
      return;
    }

    await enableCustomLocation(executablePath);
  };

  const onResetClick = () => {
    const clearCustomLocation = true;
    disableCustomLocation(clearCustomLocation);
  };

  const isBrowseButtonDisabled = customExecutableLocation === '';
  const isResetButtonDisabled = customExecutableLocation === '' && !customLocationEnabled;

  return (
    <div className="flex flex-col gap-y-4">
      <Checkbox
        label={<Trans>Enable custom location</Trans>}
        isChecked={customLocationEnabled}
        onChange={onCheckboxChange}
      />
      <div className="flex items-center gap-x-8">
        <TextInput value={customExecutableLocation} isReadOnly={true} />
        <RevealFileInExplorerButton path={customExecutableLocation} isDisabled={isBrowseButtonDisabled} />
        <ChangeButton isDisabled={!customLocationEnabled} onClick={onChangeClick} />
        <ResetButton isDisabled={isResetButtonDisabled} onClick={onResetClick} />
      </div>
    </div>
  );
}
