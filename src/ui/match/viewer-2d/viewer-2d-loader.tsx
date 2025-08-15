import React, { useState, useEffect, type ReactNode, useCallback } from 'react';
import { Trans } from '@lingui/react/macro';
import { Status } from 'csdm/common/types/status';
import { Viewer2D } from './viewer-2d';
import { UnsupportedMap } from '../../components/unsupported-map';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Message } from 'csdm/ui/components/message';
import type { Kill } from 'csdm/common/types/kill';
import type { PlayerPosition } from 'csdm/common/types/player-position';
import type { Round } from 'csdm/common/types/round';
import type { Fetch2dViewerDataPayload } from 'csdm/server/handlers/renderer-process/match/fetch-2d-viewer-data-handler';
import { useCurrentMatchMap } from '../use-current-match-map';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { InfernoPosition } from 'csdm/common/types/inferno-position';
import { useCurrentMatch } from '../use-current-match';
import type { HostagePosition } from 'csdm/common/types/hostage-position';
import { ViewerProvider } from './viewer-context';
import type { BombExploded } from 'csdm/common/types/bomb-exploded';
import type { GrenadePosition } from 'csdm/common/types/grenade-position';
import type { BombPlanted } from 'csdm/common/types/bomb-planted';
import type { BombDefused } from 'csdm/common/types/bomb-defused';
import type { Shot } from 'csdm/common/types/shot';
import { useParams } from 'react-router';
import type { BombPlantStart } from 'csdm/common/types/bomb-plant-start';
import type { BombDefuseStart } from 'csdm/common/types/bomb-defuse-start';
import type { HostagePickUpStart } from 'csdm/common/types/hostage-pick-up-start';
import type { HostagePickedUp } from 'csdm/common/types/hostage-picked-up';
import type { ChickenPosition } from 'csdm/common/types/chicken-position';
import type { HeGrenadeExplode } from 'csdm/common/types/he-grenade-explode';
import type { SmokeStart } from 'csdm/common/types/smoke-start';
import type { DecoyStart } from 'csdm/common/types/decoy-start';
import type { FlashbangExplode } from 'csdm/common/types/flashbang-explode';
import { ErrorCode } from 'csdm/common/error-code';
import { NoPositionsFound } from './no-positions-found';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { audioLoaded, resetAudioOffset } from './viewer-actions';

type State = {
  error: ReactNode | undefined;
  round: Round | undefined;
  playerPositions: PlayerPosition[];
  kills: Kill[];
  shots: Shot[];
  heGrenadesExplode: HeGrenadeExplode[];
  flashbangsExplode: FlashbangExplode[];
  smokesStart: SmokeStart[];
  decoysStart: DecoyStart[];
  grenadePositions: GrenadePosition[];
  infernoPositions: InfernoPosition[];
  chickenPositions: ChickenPosition[];
  hostagesPickUpStart: HostagePickUpStart[];
  hostagesPickedUp: HostagePickedUp[];
  hostagePositions: HostagePosition[];
  bombsPlantStart: BombPlantStart[];
  bombsDefuseStart: BombDefuseStart[];
  bombExploded: BombExploded | null;
  bombPlanted: BombPlanted | null;
  bombDefused: BombDefused | null;
  status: Status;
  audio: HTMLAudioElement | null; // the audio element used during playback
  audioBytes: Uint8Array<ArrayBuffer>; // the audio bytes used for the audio waveform
};

const defaultState: State = {
  error: undefined,
  kills: [],
  shots: [],
  playerPositions: [],
  grenadePositions: [],
  infernoPositions: [],
  chickenPositions: [],
  decoysStart: [],
  heGrenadesExplode: [],
  flashbangsExplode: [],
  smokesStart: [],
  hostagesPickUpStart: [],
  hostagesPickedUp: [],
  hostagePositions: [],
  bombsPlantStart: [],
  bombsDefuseStart: [],
  bombExploded: null,
  bombPlanted: null,
  bombDefused: null,
  round: undefined,
  status: Status.Loading,
  audio: null,
  audioBytes: new Uint8Array(),
};

export function Viewer2DLoader() {
  const { number: roundNumberParameter } = useParams();
  const roundNumber = Number(roundNumberParameter || 1);
  const client = useWebSocketClient();
  const match = useCurrentMatch();
  const map = useCurrentMatchMap();
  const [state, setState] = useState<State>(defaultState);
  const showToast = useShowToast();
  const dispatch = useDispatch();

  const loadAudioFile = useCallback(
    async (audioFilePath: string) => {
      if (state.audio) {
        return;
      }

      const data = await window.csdm.getDemoAudioData(match.checksum, audioFilePath);
      if (data) {
        dispatch(audioLoaded(data));
        setState((state) => {
          return {
            ...state,
            audio: data.audio,
            audioBytes: data.audioBytes,
          };
        });
      }
    },
    [match.checksum, state.audio, dispatch],
  );

  const unloadAudioFile = () => {
    dispatch(resetAudioOffset());
    setState((state) => {
      return {
        ...state,
        audio: null,
        audioBytes: new Uint8Array(),
      };
    });
  };

  useEffect(() => {
    if (state.status !== Status.Loading && (!state.round || state.round.number === roundNumber)) {
      return;
    }

    const fetchData = async () => {
      try {
        const payload: Fetch2dViewerDataPayload = {
          checksum: match.checksum,
          demoFilePath: match.demoFilePath,
          roundNumber,
        };
        setState((state) => {
          return {
            ...state,
            status: Status.Loading,
          };
        });
        const result = await client.send({
          name: RendererClientMessageName.Fetch2DViewerData,
          payload,
        });

        if (result.audioFilePath) {
          try {
            await loadAudioFile(result.audioFilePath);
          } catch (error) {
            logger.error('Error fetching demo audio data');
            logger.error(error);
            showToast({
              type: 'error',
              content: (
                <div>
                  <p>
                    <Trans>An error occurred while loading the audio file found for this match.</Trans>
                  </p>
                  <p>
                    <Trans>Make sure the file is a valid audio file.</Trans>
                  </p>
                </div>
              ),
            });
          }
        }

        setState((state) => {
          return {
            ...state,
            ...result,
            status: Status.Success,
          };
        });
      } catch (error) {
        let errorMessage = <Trans>An error occurred while loading round number {roundNumber}.</Trans>;
        if (error === ErrorCode.RoundNotFound) {
          errorMessage = <Trans>Round number {roundNumber} not found.</Trans>;
        }
        setState((state) => ({
          ...state,
          status: Status.Error,
          error: errorMessage,
        }));
      }
    };

    fetchData();
  }, [
    showToast,
    client,
    dispatch,
    state.status,
    state.round,
    roundNumber,
    match.checksum,
    match.demoFilePath,
    loadAudioFile,
  ]);

  useEffect(() => {
    return () => {
      if (state.audio) {
        state.audio.pause();
        // eslint-disable-next-line react-hooks/react-compiler
        state.audio.currentTime = 0;
        state.audio.src = '';
      }
    };
  }, [state.audio]);

  if (state.status === Status.Loading) {
    return <Message message={<Trans>Loading round number {roundNumber}…</Trans>} />;
  }

  if (state.status === Status.Error) {
    return <Message message={state.error} />;
  }

  if (map === undefined || map.radarFilePath === undefined) {
    return <UnsupportedMap />;
  }

  if (state.round === undefined) {
    return <Message message={<Trans>Round number {roundNumber} not found.</Trans>} />;
  }

  if (Object.keys(state.playerPositions).length === 0) {
    return (
      <NoPositionsFound
        onPositionsAvailable={() => {
          setState({
            ...state,
            status: Status.Loading,
          });
        }}
      />
    );
  }

  return (
    <ViewerProvider
      map={map}
      shots={state.shots}
      kills={state.kills}
      round={state.round}
      playerPositions={state.playerPositions}
      hostagesPickUpStart={state.hostagesPickUpStart}
      hostagesPickedUp={state.hostagesPickedUp}
      hostagePositions={state.hostagePositions}
      grenadePositions={state.grenadePositions}
      infernoPositions={state.infernoPositions}
      chickenPositions={state.chickenPositions}
      decoysStart={state.decoysStart}
      heGrenadesExplode={state.heGrenadesExplode}
      flashbangsExplode={state.flashbangsExplode}
      smokesStart={state.smokesStart}
      bombExploded={state.bombExploded}
      bombPlanted={state.bombPlanted}
      bombDefused={state.bombDefused}
      bombsDefuseStart={state.bombsDefuseStart}
      bombsPlantStart={state.bombsPlantStart}
      audio={state.audio}
      audioBytes={state.audioBytes}
      loadAudioFile={loadAudioFile}
      unloadAudioFile={unloadAudioFile}
    >
      <Viewer2D />
    </ViewerProvider>
  );
}
