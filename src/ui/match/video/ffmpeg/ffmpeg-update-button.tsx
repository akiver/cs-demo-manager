import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useIsFfmpegUpdateAvailable } from './use-is-ffmpeg-update-available';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useFfmpegSettings } from 'csdm/ui/settings/video/ffmpeg/use-ffmpeg-settings';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { UpdateButton } from 'csdm/ui/components/buttons/update-button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { updateFfmpegSuccess } from './ffmpeg-actions';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';

export function FfmpegUpdateButton() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const isFfmpegUpdateAvailable = useIsFfmpegUpdateAvailable();
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const ffmpegSettings = useFfmpegSettings();
  const isDisabled = !isFfmpegUpdateAvailable || isUpdating || ffmpegSettings.customLocationEnabled;

  const onClick = async () => {
    try {
      showToast({
        content: <Trans>Updating FFmpeg…</Trans>,
        id: 'ffmpeg-update',
      });
      setIsUpdating(true);
      const version = await client.send({
        name: RendererClientMessageName.UpdateFfmpeg,
      });
      dispatch(updateFfmpegSuccess({ version }));
      showToast({
        content: <Trans>FFmpeg has been updated</Trans>,
        id: 'ffmpeg-update',
        type: 'success',
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred while updating FFmpeg</Trans>,
        id: 'ffmpeg-update',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <UpdateButton
      onClick={onClick}
      isDisabled={isDisabled}
      variant={isFfmpegUpdateAvailable ? ButtonVariant.Primary : ButtonVariant.Default}
    />
  );
}
