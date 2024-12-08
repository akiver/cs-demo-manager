import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import type { Sequence } from 'csdm/common/types/sequence';
import type { SequenceForm } from './sequence-form';
import { useCurrentMatch } from '../../use-current-match';

export type SequenceFormContextState = {
  sequence: SequenceForm;
  updateSequence: (sequence: Partial<SequenceForm>) => void;
  setStartTick: (tick: number) => void;
  setEndTick: (tick: number) => void;
  setCameraOnPlayerAtTick: (options: { playerSteamId: string; tick: number; oldTick?: number }) => void;
  removeCameraAtTick: (tick: number) => void;
  clearCameras: () => void;
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
  setCameraOnPlayerAtTick: () => {
    throw new Error('setCameraOnPlayerAtTick is not implemented');
  },
  removeCameraAtTick: () => {
    throw new Error('removeCameraAtTick is not implemented');
  },
  clearCameras: () => {
    throw new Error('clearCameras is not implemented');
  },
});

type Props = {
  initialSequence: Sequence;
  children: ReactNode;
};

export function SequenceFormProvider({ children, initialSequence }: Props) {
  const match = useCurrentMatch();
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

  const setCameraOnPlayerAtTick: SequenceFormContextState['setCameraOnPlayerAtTick'] = ({
    playerSteamId,
    tick,
    oldTick,
  }) => {
    const newCameras = sequence.cameras.filter((camera) => camera.tick !== tick && camera.tick !== oldTick);
    const player = match.players.find((player) => player.steamId === playerSteamId);
    if (!player) {
      return;
    }

    updateSequence({
      cameras: [
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
      cameras: sequence.cameras.filter((camera) => camera.tick !== tick),
    });
  };

  const clearCameras = () => {
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
        setCameraOnPlayerAtTick,
        removeCameraAtTick,
        clearCameras,
      }}
    >
      {children}
    </SequenceFormContext>
  );
}
