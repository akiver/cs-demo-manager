import React from 'react';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';
import { DetailsItem } from './details-item';

type Props = {
  demoPath: string;
};

export function NavigateToDemoItem({ demoPath }: Props) {
  const navigateToDemo = useNavigateToDemo();

  const onClick = () => {
    navigateToDemo(demoPath);
  };

  return <DetailsItem onClick={onClick} />;
}
