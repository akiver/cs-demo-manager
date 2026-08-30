import { useEffect } from 'react';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { ValveMatch } from 'csdm/common/types/valve-match';
import type { Demo } from 'csdm/common/types/demo';
import {
  currentSteamIdDetected,
  fetchLastMatchesError as fetchLastValveMatchesError,
  fetchLastMatchesSuccess as fetchLastValveMatchesSuccess,
  fetchLastMatchesStart as fetchLastValveMatchesStart,
} from 'csdm/ui/downloads/valve/valve-actions';
import {
  demoDownloadedInCurrentFolderLoaded,
  downloadDemoCorrupted,
  downloadDemoError,
  downloadDemoExpired,
  downloadDemoProgressChanged,
  downloadDemoSuccess,
  downloadsAdded,
} from 'csdm/ui/downloads/downloads-actions';
import { useDispatch } from '../../store/use-dispatch';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import type { ErrorCode } from 'csdm/common/error-code';
import type { Download, DownloadDemoProgressPayload, DownloadDemoSuccess } from 'csdm/common/download/download-types';

function useRegisterFetchLastValveMatchesListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onStart = () => {
      dispatch(fetchLastValveMatchesStart());
    };

    const onSuccess = (matches: ValveMatch[]) => {
      dispatch(fetchLastValveMatchesSuccess({ matches }));
    };

    const onError = (errorCode: ErrorCode) => {
      dispatch(fetchLastValveMatchesError({ errorCode }));
    };

    const onSteamIdDetected = (steamId: string) => {
      dispatch(currentSteamIdDetected({ steamId }));
    };

    client.on(ServerPushMessageName.FetchLastValveMatchesStart, onStart);
    client.on(ServerPushMessageName.FetchLastValveMatchesSuccess, onSuccess);
    client.on(ServerPushMessageName.FetchLastValveMatchesError, onError);
    client.on(ServerPushMessageName.FetchLastValveMatchesSteamIdDetected, onSteamIdDetected);

    return () => {
      client.off(ServerPushMessageName.FetchLastValveMatchesStart, onStart);
      client.off(ServerPushMessageName.FetchLastValveMatchesSuccess, onSuccess);
      client.off(ServerPushMessageName.FetchLastValveMatchesError, onError);
      client.off(ServerPushMessageName.FetchLastValveMatchesSteamIdDetected, onSteamIdDetected);
    };
  });
}

export function useRegisterDownloadsListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onDownloadsAdded = (downloads: Download[]) => {
      dispatch(downloadsAdded({ downloads }));
    };
    client.on(ServerPushMessageName.DownloadsAdded, onDownloadsAdded);

    const onDownloadProgress = ({ matchId, progress }: DownloadDemoProgressPayload) => {
      dispatch(downloadDemoProgressChanged({ matchId, progress }));
    };
    client.on(ServerPushMessageName.DownloadDemoProgress, onDownloadProgress);

    const onDemoExpired = (matchId: string) => {
      dispatch(downloadDemoExpired({ matchId }));
    };
    client.on(ServerPushMessageName.DownloadDemoExpired, onDemoExpired);

    const onDownloadDemoSuccess = (payload: DownloadDemoSuccess) => {
      dispatch(downloadDemoSuccess(payload));
    };
    client.on(ServerPushMessageName.DownloadDemoSuccess, onDownloadDemoSuccess);

    const onDownloadDemoCorrupted = (matchId: string) => {
      dispatch(downloadDemoCorrupted({ matchId }));
    };
    client.on(ServerPushMessageName.DownloadDemoCorrupted, onDownloadDemoCorrupted);

    const onDownloadDemoError = (matchId: string) => {
      dispatch(downloadDemoError({ matchId }));
    };
    client.on(ServerPushMessageName.DownloadDemoError, onDownloadDemoError);

    const onDownloadedDemoInCurrentFolderLoaded = (demo: Demo) => {
      dispatch(demoDownloadedInCurrentFolderLoaded(demo));
    };
    client.on(ServerPushMessageName.DownloadDemoInCurrentFolderLoaded, onDownloadedDemoInCurrentFolderLoaded);

    return () => {
      client.off(ServerPushMessageName.DownloadsAdded, onDownloadsAdded);
      client.off(ServerPushMessageName.DownloadDemoProgress, onDownloadProgress);
      client.off(ServerPushMessageName.DownloadDemoExpired, onDemoExpired);
      client.off(ServerPushMessageName.DownloadDemoSuccess, onDownloadDemoSuccess);
      client.off(ServerPushMessageName.DownloadDemoCorrupted, onDownloadDemoCorrupted);
      client.off(ServerPushMessageName.DownloadDemoError, onDownloadDemoError);
      client.off(ServerPushMessageName.DownloadDemoInCurrentFolderLoaded, onDownloadedDemoInCurrentFolderLoaded);
    };
  });

  useRegisterFetchLastValveMatchesListeners(client);
}
