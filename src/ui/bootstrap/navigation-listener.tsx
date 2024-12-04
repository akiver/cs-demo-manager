import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { IpcRendererEvent } from 'electron';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { RoutePath, buildPendingDownloadPath } from '../routes-paths';
import { useArgument } from './use-argument';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';

type Props = {
  children: ReactNode;
};

export function NavigationListener({ children }: Props) {
  const client = useWebSocketClient();
  const navigate = useNavigate();
  const navigateToMatch = useNavigateToMatch();
  const navigateToDemo = useNavigateToDemo();
  const demoPathArgument = useArgument(ArgumentName.DemoPath);

  useEffect(() => {
    const navigateToBans = () => {
      navigate(RoutePath.Ban);
    };

    const unListen = window.csdm.onNavigateToBans(navigateToBans);

    return () => {
      unListen();
    };
  }, [navigate]);

  useEffect(() => {
    const navigateToPendingDownloads = () => {
      navigate(buildPendingDownloadPath());
    };

    const unListen = window.csdm.onNavigateToPendingDownloads(navigateToPendingDownloads);

    return () => {
      unListen();
    };
  }, [navigate]);

  useEffect(() => {
    client.on(RendererServerMessageName.NavigateToDemo, navigateToDemo);

    return () => {
      client.off(RendererServerMessageName.NavigateToDemo, navigateToDemo);
    };
  }, [client, navigateToDemo]);

  useEffect(() => {
    client.on(RendererServerMessageName.NavigateToMatch, navigateToMatch);

    return () => {
      client.off(RendererServerMessageName.NavigateToMatch, navigateToMatch);
    };
  }, [client, navigateToMatch]);

  useEffect(() => {
    const sendNavigateToDemoOrMatch = (demoPath: string) => {
      client.send({
        name: RendererClientMessageName.NavigateToDemoOrMatch,
        payload: demoPath,
      });
    };
    const onOpenDemoFile = (event: IpcRendererEvent, demoPath: string) => {
      sendNavigateToDemoOrMatch(demoPath);
    };

    if (demoPathArgument !== undefined) {
      sendNavigateToDemoOrMatch(demoPathArgument);
    }

    const unListen = window.csdm.onOpenDemoFile(onOpenDemoFile);

    return () => {
      unListen();
    };
  }, [client, demoPathArgument]);

  return <>{children}</>;
}
