import React, { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import type { Sequence } from 'csdm/common/types/sequence';
import type { SequenceForm } from './sequence-form';

export type SequenceFormContextState = {
  sequence: SequenceForm;
  updateSequence: (sequence: Partial<SequenceForm>) => void;
};

export const SequenceFormContext = createContext<SequenceFormContextState>({
  sequence: {} as SequenceForm,
  updateSequence: () => {
    throw new Error('updateSequence is not implemented');
  },
});

type Props = {
  initialSequence: Sequence;
  children: ReactNode;
};

export function SequenceFormProvider({ children, initialSequence }: Props) {
  const [sequence, setSequence] = useState<SequenceForm>({
    ...initialSequence,
    startTick: String(initialSequence.startTick),
    endTick: String(initialSequence.endTick),
  });

  return (
    <SequenceFormContext.Provider
      value={{
        sequence,
        updateSequence: (partialSequence) => {
          setSequence((sequence) => {
            return {
              ...sequence,
              ...partialSequence,
            };
          });
        },
      }}
    >
      {children}
    </SequenceFormContext.Provider>
  );
}
