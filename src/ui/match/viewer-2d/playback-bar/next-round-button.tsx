import React, { useEffect } from 'react';
import { useViewerContext } from '../use-viewer-context';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { PlaybackBarButton } from './playback-bar-button';
import { StepForwardIcon } from 'csdm/ui/icons/step-forward-icon';
import { isCtrlOrCmdEvent } from 'csdm/ui/keyboard/keyboard';

export function NextRoundButton() {
  const match = useCurrentMatch();
  const { round, changeRound } = useViewerContext();
  const onClick = () => {
    changeRound(round.number + 1);
  };
  const isDisabled = round.number > match.rounds.length - 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      if (event.key === 'n' && !isCtrlOrCmdEvent(event)) {
        changeRound(round.number + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [changeRound, isDisabled, round.number]);

  return (
    <PlaybackBarButton onClick={onClick} isDisabled={isDisabled}>
      <StepForwardIcon />
    </PlaybackBarButton>
  );
}
