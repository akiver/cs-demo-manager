import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useIsHlaeUpdateAvailable } from 'csdm/ui/match/video/hlae/use-is-hlae-update-available';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { UpdateButton } from 'csdm/ui/components/buttons/update-button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { updateHlaeSuccess } from './hlae-actions';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';

export function HlaeUpdateButton() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const isHlaeUpdateAvailable = useIsHlaeUpdateAvailable();
  const [isUpdating, setIsUpdating] = useState(false);

  const onClick = async () => {
    try {
      showToast({
        content: <Trans>Updating HLAE…</Trans>,
        id: 'hlae-update',
      });
      setIsUpdating(true);
      const version = await client.send({
        name: RendererClientMessageName.UpdateHlae,
      });
      dispatch(updateHlaeSuccess({ version }));
      showToast({
        content: <Trans>HLAE has been updated</Trans>,
        id: 'hlae-update',
        type: 'success',
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred while updating HLAE</Trans>,
        id: 'hlae-update',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <UpdateButton
      onClick={onClick}
      isDisabled={!isHlaeUpdateAvailable || isUpdating}
      variant={isHlaeUpdateAvailable ? ButtonVariant.Primary : ButtonVariant.Default}
    />
  );
}
