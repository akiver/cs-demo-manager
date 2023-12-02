import React from 'react';
import { useNavigateToMatch } from 'csdm/ui/hooks/use-navigate-to-match';
import { DetailsItem } from './details-item';

type Props = {
  checksum: string;
  siblingChecksums: string[];
};

export function NavigateToMatchItem({ checksum, siblingChecksums }: Props) {
  const navigateToMatch = useNavigateToMatch();

  const onClick = () => {
    navigateToMatch(checksum, {
      state: {
        siblingChecksums,
      },
    });
  };

  return <DetailsItem onClick={onClick} />;
}
