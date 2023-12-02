import React from 'react';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';

export function WatchMatchButton() {
  const match = useCurrentMatch();

  return <WatchButton demoPath={match.demoFilePath} game={match.game} />;
}
