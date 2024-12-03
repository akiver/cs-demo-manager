import type { FileFilter } from 'electron';
import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RevealFileInExplorerButton } from 'csdm/ui/components/buttons/reveal-file-in-explorer-button';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { ErrorCode } from 'csdm/common/error-code';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useFfmpegSettings } from './use-ffmpeg-settings';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ffmpegVersionChanged } from '../../settings-actions';
import { ResetButton } from 'csdm/ui/components/buttons/reset-button';
import { ChangeButton } from 'csdm/ui/components/buttons/change-button';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

async function showSelectExecutableDialog() {
  let filters: FileFilter[] = [];
  if (window.csdm.isWindows) {
    filters = [{ extensions: ['exe'], name: 'ffmpeg.exe' }];
  }
  const { filePaths, canceled } = await window.csdm.showOpenDialog({
    filters,
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) {
    return;
  }

  const executablePath = filePaths[0];
  return executablePath;
}

export function FfmpegLocation() {
  const ffmpegSettings = useFfmpegSettings();
  const { customExecutableLocation, customLocationEnabled } = ffmpegSettings;
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const showToast = useShowToast();

  const handleError = (error: ReactNode) => {
    showToast({
      id: 'ffmpeg-custom-location-error',
      content: error,
      type: 'error',
    });
  };

  const enableFfmpegCustomLocation = async (executablePath: string) => {
    try {
      const result = await client.send({
        name: RendererClientMessageName.EnableFfmpegCustomLocation,
        payload: executablePath,
      });
      dispatch(ffmpegVersionChanged(result));
    } catch (error) {
      let errorMessage = <Trans>An error occurred</Trans>;
      switch (error) {
        case ErrorCode.FileNotFound:
          errorMessage = <Trans>File not found</Trans>;
          break;
        case ErrorCode.InvalidFfmpegExecutable:
          errorMessage = <Trans>Invalid FFmpeg executable</Trans>;
          break;
      }

      handleError(errorMessage);
    }
  };

  const disableFfmpegCustomLocation = async (clearCustomLocation: boolean) => {
    const result = await client.send({
      name: RendererClientMessageName.DisableFfmpegCustomLocation,
      payload: clearCustomLocation,
    });
    dispatch(ffmpegVersionChanged(result));
    // Ignore known errors because if one occurs, FFmpeg will be flagged as not installed.
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

      enableFfmpegCustomLocation(newExecutablePath);
    } else {
      const clearCustomLocation = false;
      disableFfmpegCustomLocation(clearCustomLocation);
    }
  };

  const onChangeClick = async () => {
    const executablePath = await showSelectExecutableDialog();
    if (executablePath === undefined) {
      return;
    }

    await enableFfmpegCustomLocation(executablePath);
  };

  const onResetClick = () => {
    const clearCustomLocation = true;
    disableFfmpegCustomLocation(clearCustomLocation);
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
