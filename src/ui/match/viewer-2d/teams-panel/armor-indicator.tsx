import React from 'react';
import { ArmorIcon } from 'csdm/ui/icons/armor-icon';
import { ArmorWithHelmetIcon } from 'csdm/ui/icons/armor-with-helmet-icon';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="absolute left-4 bottom-4">{children}</div>;
}

type Props = {
  armor: number;
  hasHelmet: boolean;
};

export function ArmorIndicator({ armor, hasHelmet }: Props) {
  if (hasHelmet) {
    return (
      <Wrapper>
        <ArmorWithHelmetIcon size={16} />
      </Wrapper>
    );
  }

  if (armor > 0) {
    return (
      <Wrapper>
        <ArmorIcon size={16} />
      </Wrapper>
    );
  }

  return null;
}
