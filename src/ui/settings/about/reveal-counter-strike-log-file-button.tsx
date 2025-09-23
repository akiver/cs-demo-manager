import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { Game } from 'csdm/common/types/counter-strike';
import { isSuccessResult } from 'csdm/preload/preload-result';
import { ErrorCode } from 'csdm/common/error-code';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

type Props = {
  game: Game;
};

export function RevealCounterStrikeLogFileButton({ game }: Props) {
  const showToast = useShowToast();

  const onBrowseClick = async () => {
    const result = await window.csdm.getCounterStrikeLogFilePath(game);
    if (isSuccessResult(result)) {
      return window.csdm.browseToFile(result.success);
    }

    let message: ReactNode;
    if (result.error.code === ErrorCode.FileNotFound) {
      message = <Trans>The log file does not exist</Trans>;
    } else {
      message = <Trans>An error occurred</Trans>;
    }
    showToast({ content: message, type: 'error' });
  };
  const gameName = game === Game.CS2 ? 'CS2' : 'CSGO';

  return (
    <Button onClick={onBrowseClick}>
      <Trans>Reveal {gameName} log file</Trans>
    </Button>
  );
}
