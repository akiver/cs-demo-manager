import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { InstallButton } from 'csdm/ui/components/buttons/install-button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useIsFfmpegInstalled } from './use-is-ffmpeg-installed';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useFfmpegSettings } from 'csdm/ui/settings/video/ffmpeg/use-ffmpeg-settings';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { installFfmpegSuccess } from './ffmpeg-actions';

export function FfmpegInstallButton() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const isFfmpegInstalled = useIsFfmpegInstalled();
  const [isInstalling, setIsInstalling] = useState(false);
  const ffmpegSettings = useFfmpegSettings();
  const isDisabled = isFfmpegInstalled || ffmpegSettings.customLocationEnabled;

  const onClick = async () => {
    try {
      showToast({
        content: <Trans>Installing FFmpeg…</Trans>,
        id: 'ffmpeg-installation',
      });
      setIsInstalling(true);
      const version = await client.send({
        name: RendererClientMessageName.InstallFfmpeg,
      });
      dispatch(installFfmpegSuccess({ version }));
      showToast({
        content: <Trans>FFmpeg has been installed</Trans>,
        id: 'ffmpeg-installation',
        type: 'success',
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred while installing FFmpeg</Trans>,
        id: 'ffmpeg-installation',
        type: 'error',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return <InstallButton isDisabled={isDisabled} isInstalling={isInstalling} onClick={onClick} />;
}
