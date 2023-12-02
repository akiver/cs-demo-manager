import React from 'react';
import { useNavigateToPlayer } from 'csdm/ui/hooks/use-navigate-to-player';
import { DetailsItem } from './details-item';

type Props = {
  steamId: string;
};

export function NavigateToPlayerItem({ steamId }: Props) {
  const navigateToPlayer = useNavigateToPlayer();
  const onClick = () => {
    navigateToPlayer(steamId);
  };

  return <DetailsItem onClick={onClick} />;
}
