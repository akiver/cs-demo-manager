import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  isVisible: boolean;
};

export function CollapseTransition({ children, isVisible }: Props) {
  return (
    <div
      className="grid transition-[grid-template-rows,opacity] duration-200 ease-out"
      style={{
        gridTemplateRows: isVisible ? '1fr' : '0fr',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
