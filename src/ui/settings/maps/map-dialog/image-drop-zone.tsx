import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
};

export function ImageDragZone({ children, onDrop, onClick }: Props) {
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      className="flex size-[200px] cursor-pointer items-center justify-center border border-gray-300"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children}
    </div>
  );
}
