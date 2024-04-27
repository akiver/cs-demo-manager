import React from 'react';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';
import { DetailsItem } from './details-item';

type Props = {
  demoPath: string;
  siblingDemoPaths: string[];
};

export function NavigateToDemoItem({ demoPath, siblingDemoPaths }: Props) {
  const navigateToDemo = useNavigateToDemo();

  const onClick = () => {
    navigateToDemo(demoPath, {
      state: {
        siblingDemoPaths,
      },
    });
  };

  return <DetailsItem onClick={onClick} />;
}
