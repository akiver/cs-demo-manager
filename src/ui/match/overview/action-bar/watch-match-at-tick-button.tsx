import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { isCounterStrikeStartable, useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';

function WatchAtTickDialog() {
  const { t } = useLingui();
  const [tick, setTick] = useState<string>('');
  const [isCsRunningDialogVisible, setIsCsRunningDialogVisible] = useState(false);
  const { watchDemo, isKillCsRequired } = useCounterStrike();
  const match = useCurrentMatch();
  const { hideDialog } = useDialog();

  const startWatchDemo = () => {
    watchDemo({
      demoPath: match.demoFilePath,
      startTick: Number(tick),
    });
    hideDialog();
  };

  const onSubmit = async () => {
    const isTickValid = tick !== '';
    if (!isTickValid) {
      return;
    }

    const shouldKillCs = await isKillCsRequired();
    if (shouldKillCs) {
      setIsCsRunningDialogVisible(true);
    } else {
      startWatchDemo();
    }
  };

  if (isCsRunningDialogVisible) {
    const onConfirmClick = () => {
      startWatchDemo();
    };

    return <CounterStrikeRunningDialog onConfirmClick={onConfirmClick} />;
  }

  return (
    <Dialog onEnterPressed={onSubmit}>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Watch at tick</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8">
          <p>
            <Trans>The playback will start at the specified tick.</Trans>
          </p>
          <InputNumber
            defaultValue={tick}
            focusOnMount={true}
            onChange={(event) => {
              const value = event.target.value;
              setTick(value);
            }}
            placeholder={t`Tick`}
          />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onSubmit} variant={ButtonVariant.Primary}>
          <Trans context="Button">Watch</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}

export function WatchMatchAtTickButton() {
  const { showDialog } = useDialog();
  const match = useCurrentMatch();

  const onClick = () => {
    showDialog(<WatchAtTickDialog />);
  };

  if (!isCounterStrikeStartable(match.game)) {
    return null;
  }

  return (
    <Button onClick={onClick}>
      <Trans context="Button">Watch at tick</Trans>
    </Button>
  );
}
