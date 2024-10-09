import React from 'react';
import { useNavigateToTeam } from 'csdm/ui/hooks/use-navigate-to-team';
import { DetailsItem } from './details-item';

type Props = {
  teamName: string;
};

export function NavigateToTeamItem({ teamName }: Props) {
  const navigateToTeam = useNavigateToTeam();
  const onClick = () => {
    navigateToTeam(teamName);
  };

  return <DetailsItem onClick={onClick} />;
}
