import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from 'csdm/ui/dialogs/dialog';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';

export type TickPosition = 'start' | 'end';
export type TickOperation = 'minus' | 'plus';

type DialogProps = {
  tick: number;
  operation: TickOperation;
  onSubmit: (tick: number) => void;
};

export function SelectSecondsDialog({ onSubmit, tick, operation }: DialogProps) {
  const [seconds, setSeconds] = useState('');
  const { hideDialog } = useDialog();
  const match = useCurrentMatch();
  const submit = () => {
    const secondsAsNumber = Number(seconds);
    const ticks = secondsAsNumber * match.tickrate;
    const newTick = operation === 'minus' ? tick - ticks : tick + ticks;
    const isValidTick = newTick > 0 && newTick < match.tickCount;
    if (isValidTick) {
      onSubmit(newTick);
    }
    hideDialog();
  };

  return (
    <Dialog onEnterPressed={submit}>
      <DialogHeader>
        <p>
          <Trans context="Dialog title">Enter the number of seconds</Trans>
        </p>
      </DialogHeader>
      <DialogContent>
        <InputNumber
          defaultValue={seconds}
          focusOnMount={true}
          onChange={(event) => {
            setSeconds(event.target.value);
          }}
          placeholder="10"
        />
      </DialogContent>
      <DialogFooter>
        <Button onClick={submit} variant={ButtonVariant.Primary}>
          <Trans context="Button">Confirm</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
