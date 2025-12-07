import React, { type ReactNode } from 'react';
import { Button } from './button';

type Props = {
  url: string;
  children: ReactNode;
};

export function OpenLinkButton({ url, children }: Props) {
  const onClick = () => {
    window.open(url);
  };

  return <Button onClick={onClick}>{children}</Button>;
}
