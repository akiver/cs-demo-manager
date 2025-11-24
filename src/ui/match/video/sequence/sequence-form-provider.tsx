import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import type { Sequence } from 'csdm/common/types/sequence';
import type { SequenceForm } from './sequence-form';
import { useCurrentMatch } from '../../use-current-match';
import { useCameras } from 'csdm/ui/cameras/use-cameras';

export type SequenceFormContextState = {
  sequence: SequenceForm;
  updateSequence: (sequence: Partial<SequenceForm>) => void;
  setStartTick: (tick: number) => void;
  setEndTick: (tick: number) => void;
  setCameraOnPlayerAtTick: (options: { playerSteamId: string; tick: number; oldTick?: number }) => void;
  setCameraAtTick: (options: { cameraId: string; tick: number; oldTick?: number }) => void;
  removeCameraAtTick: (tick: number) => void;
  clearPlayerCameras: () => void;
  clearCustomCameras: () => void;
};

export const SequenceFormContext = createContext<SequenceFormContextState>({
  sequence: {} as SequenceForm,
  updateSequence: () => {
    throw new Error('updateSequence is not implemented');
  },
  setStartTick: () => {
    throw new Error('setStartTick is not implemented');
  },
  setEndTick: () => {
    throw new Error('setEndTick is not implemented');
  },
  setCameraAtTick: () => {
    throw new Error('setCameraAtTick is not implemented');
  },
  setCameraOnPlayerAtTick: () => {
    throw new Error('setCameraOnPlayerAtTick is not implemented');
  },
  removeCameraAtTick: () => {
    throw new Error('removeCameraAtTick is not implemented');
  },
  clearPlayerCameras: () => {
    throw new Error('clearPlayerCameras is not implemented');
  },
  clearCustomCameras: () => {
    throw new Error('clearCustomCameras is not implemented');
  },
});

type Props = {
  initialSequence: Sequence;
  children: ReactNode;
};

export function SequenceFormProvider({ children, initialSequence }: Props) {
  const match = useCurrentMatch();
  const cameras = useCameras(match.game, match.mapName);
  const [sequence, setSequence] = useState<SequenceForm>({
    ...initialSequence,
    startTick: String(initialSequence.startTick),
    endTick: String(initialSequence.endTick),
    playerVoicesEnabled: true,
  });

  const updateSequence = (partialSequence: Partial<SequenceForm>) => {
    setSequence((sequence) => {
      return {
        ...sequence,
        ...partialSequence,
      };
    });
  };

  const setStartTick = (tick: number) => {
    updateSequence({
      startTick: String(tick),
    });
  };

  const setEndTick = (tick: number) => {
    updateSequence({
      endTick: String(tick),
    });
  };

  const setCameraAtTick: SequenceFormContextState['setCameraAtTick'] = ({ cameraId, tick, oldTick }) => {
    const newCameras = sequence.cameras.filter((camera) => camera.tick !== tick && camera.tick !== oldTick);
    const camera = cameras.find((camera) => camera.id === cameraId);
    if (!camera) {
      return;
    }

    updateSequence({
      cameras: [
        ...newCameras,
        {
          tick,
          id: camera.id,
          name: camera.name,
          color: camera.color,
        },
      ],
    });
  };

  const setCameraOnPlayerAtTick: SequenceFormContextState['setCameraOnPlayerAtTick'] = ({
    playerSteamId,
    tick,
    oldTick,
  }) => {
    const newCameras = sequence.playerCameras.filter((camera) => camera.tick !== tick && camera.tick !== oldTick);
    const player = match.players.find((player) => player.steamId === playerSteamId);
    if (!player) {
      return;
    }

    updateSequence({
      playerCameras: [
        ...newCameras,
        {
          tick,
          playerSteamId,
          playerName: player.name,
        },
      ],
    });
  };

  const removeCameraAtTick = (tick: number) => {
    updateSequence({
      playerCameras: sequence.playerCameras.filter((camera) => camera.tick !== tick),
      cameras: sequence.cameras.filter((camera) => camera.tick !== tick),
    });
  };

  const clearPlayerCameras = () => {
    updateSequence({
      playerCameras: [],
    });
  };

  const clearCustomCameras = () => {
    updateSequence({
      cameras: [],
    });
  };

  return (
    <SequenceFormContext
      value={{
        sequence,
        updateSequence,
        setStartTick,
        setEndTick,
        setCameraAtTick,
        setCameraOnPlayerAtTick,
        removeCameraAtTick,
        clearPlayerCameras,
        clearCustomCameras,
      }}
    >
      {children}
    </SequenceFormContext>
  );
}
