import React, { useState, type ReactNode } from 'react';
import { PlayCircleIcon } from 'csdm/ui/icons/play-circle-icon';
import { isCounterStrikeStartable, useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import type { Game } from 'csdm/common/types/counter-strike';

type Props = {
  demoPath: string;
  game: Game;
  tick: number;
  tooltip: ReactNode;
  focusSteamId?: string;
  size?: number;
};

export function PlayDemoAtTickButton({ tick, focusSteamId, demoPath, game, tooltip, size = 30 }: Props) {
  const { watchDemo, isKillCsRequired } = useCounterStrike();
  const [isCheckingCsStatus, setIsCheckingForCsStatus] = useState(false);
  const { showDialog } = useDialog();

  const startWatchDemo = () => {
    watchDemo({
      demoPath,
      startTick: tick,
      focusSteamId,
    });
  };

  const onClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isCheckingCsStatus) {
      return;
    }

    setIsCheckingForCsStatus(true);
    const shouldKillCs = await isKillCsRequired();
    if (shouldKillCs) {
      showDialog(<CounterStrikeRunningDialog onConfirmClick={startWatchDemo} />);
    } else {
      startWatchDemo();
    }
    setIsCheckingForCsStatus(false);
  };

  if (!isCounterStrikeStartable(game)) {
    return null;
  }

  return (
    <Tooltip content={tooltip} placement="left">
      <div className="hover:text-gray-900 transition duration-300" onClick={onClick}>
        <PlayCircleIcon height={size} />
      </div>
    </Tooltip>
  );
}
