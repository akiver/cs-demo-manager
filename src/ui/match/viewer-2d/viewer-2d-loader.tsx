import React, { useState, useEffect, type ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { Status } from 'csdm/common/types/status';
import { Viewer2D } from './viewer-2d';
import type { Map } from 'csdm/common/types/map';
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
import { useParams } from 'react-router-dom';
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

type State = {
  error: ReactNode | undefined;
  round: Round | undefined;
  radarFilePath?: string;
  lowerRadarFilePath?: string;
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
  status: Status.Idle,
};

export function Viewer2DLoader() {
  const { number: roundNumberParameter } = useParams();
  const roundNumber = Number(roundNumberParameter || 1);
  const client = useWebSocketClient();
  const match = useCurrentMatch();
  const map: Map | undefined = useCurrentMatchMap();
  const [state, setState] = useState<State>(defaultState);

  useEffect(() => {
    setState(defaultState);
  }, [roundNumber]);

  useEffect(() => {
    if (state.status !== Status.Idle) {
      return;
    }

    const fetchData = async () => {
      try {
        const payload: Fetch2dViewerDataPayload = {
          checksum: match.checksum,
          roundNumber,
        };
        setState({
          ...state,
          status: Status.Loading,
        });
        const result = await client.send({
          name: RendererClientMessageName.Fetch2DViewerData,
          payload,
        });

        setState({
          ...state,
          ...result,
          status: Status.Success,
        });
      } catch (error) {
        let errorMessage = <Trans>An error occurred while loading round number {roundNumber}.</Trans>;
        if (error === ErrorCode.RoundNotFound) {
          errorMessage = <Trans>Round number {roundNumber} not found.</Trans>;
        }
        setState({
          ...state,
          status: Status.Error,
          error: errorMessage,
        });
      }
    };

    fetchData();
  }, [client, state, match, roundNumber]);

  if (state.status === Status.Idle || state.status === Status.Loading) {
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
            status: Status.Idle,
          });
        }}
      />
    );
  }

  return (
    <ViewerProvider
      map={map}
      radarFilePath={map.radarFilePath}
      lowerRadarFilePath={map.lowerRadarFilePath}
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
    >
      <Viewer2D />
    </ViewerProvider>
  );
}
