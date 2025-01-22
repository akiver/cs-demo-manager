import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useIsVirtualDubInstalled } from 'csdm/ui/match/video/virtualdub/use-is-virtual-dub-installed';
import { InstallButton } from 'csdm/ui/components/buttons/install-button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { installVirtualDubSuccess } from './virtual-dub-actions';

export function VirtualDubInstallButton() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const isVirtualDubInstalled = useIsVirtualDubInstalled();
  const [isInstalling, setIsInstalling] = useState(false);

  const onClick = async () => {
    try {
      showToast({
        content: <Trans>Installing VirtualDub…</Trans>,
        id: 'vb-installation',
      });
      setIsInstalling(true);
      const version = await client.send({
        name: RendererClientMessageName.InstallVirtualDub,
      });
      dispatch(installVirtualDubSuccess({ version }));
      showToast({
        content: <Trans>VirtualDub has been installed</Trans>,
        id: 'vb-installation',
        type: 'success',
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred while installing VirtualDub</Trans>,
        id: 'vb-installation',
        type: 'error',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return <InstallButton isDisabled={isVirtualDubInstalled} isInstalling={isInstalling} onClick={onClick} />;
}
