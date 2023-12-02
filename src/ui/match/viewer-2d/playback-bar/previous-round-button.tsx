import React, { useEffect } from 'react';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { StepBackwardIcon } from 'csdm/ui/icons/step-backward-icon';
import { isCtrlOrCmdEvent } from 'csdm/ui/keyboard/keyboard';

export function PreviousRoundButton() {
  const { round, changeRound } = useViewerContext();
  const onClick = () => {
    changeRound(round.number - 1);
  };
  const isDisabled = round.number <= 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      if (event.key === 'p' && !isCtrlOrCmdEvent(event)) {
        changeRound(round.number - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [changeRound, isDisabled, round.number]);

  return (
    <PlaybackBarButton onClick={onClick} isDisabled={isDisabled}>
      <StepBackwardIcon />
    </PlaybackBarButton>
  );
}
