import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLingui } from '@lingui/react/macro';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { GameVideoSequencePayload } from 'csdm/server/messages/game-client-message-name';
import type { Sequence } from 'csdm/common/types/sequence';
import { getNextSequenceNumber } from 'csdm/common/video/sequences/get-next-sequence-number';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { addSequence } from 'csdm/ui/match/video/sequences/sequences-actions';
import { useSequencesByDemoFilePath } from 'csdm/ui/match/video/sequences/use-sequences-by-demo-file-path';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { buildMatchVideoPath } from 'csdm/ui/routes-paths';

// A video sequence marked from the playback panel of the CS2 plugin: adds it to the sequences of the demo, with the
// spectated player as the camera focus, and goes to the video page of the match.
export function useRegisterGameVideoSequenceListener(client: WebSocketClient) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useShowToast();
  const { t } = useLingui();
  const { settings } = useVideoSettings();
  const sequencesByDemoFilePath = useSequencesByDemoFilePath();

  useEffect(() => {
    const onAddVideoSequence = async ({
      checksum,
      demoPath,
      startTick,
      endTick,
      focusedPlayer,
    }: GameVideoSequencePayload) => {
      const sequences = sequencesByDemoFilePath[demoPath] ?? [];
      const sequence: Sequence = {
        number: getNextSequenceNumber(sequences),
        startTick,
        endTick,
        showXRay: settings.showXRay,
        showAssists: settings.showAssists,
        showOnlyDeathNotices: settings.showOnlyDeathNotices,
        deathNoticesDuration: settings.deathNoticesDuration,
        playersOptions: [],
        playerCameras:
          focusedPlayer === null
            ? []
            : [
                {
                  tick: startTick,
                  playerSteamId: focusedPlayer.steamId,
                  playerName: focusedPlayer.name,
                },
              ],
        cameras: [],
        playerVoicesEnabled: settings.playerVoicesEnabled,
        recordAudio: settings.recordAudio,
      };
      dispatch(addSequence({ demoFilePath: demoPath, sequence }));

      if (checksum === null) {
        showToast({
          id: 'game-video-sequence',
          content: t`Sequence added, analyze the demo to see it in the video page of the match`,
          type: 'warning',
        });
        return;
      }

      showToast({
        id: 'game-video-sequence',
        content: t`Sequence added to the video page of the match`,
        type: 'success',
      });
      await navigate(buildMatchVideoPath(checksum));
    };

    client.on(ServerPushMessageName.AddVideoSequence, onAddVideoSequence);

    return () => {
      client.off(ServerPushMessageName.AddVideoSequence, onAddVideoSequence);
    };
  });
}
