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
      className="flex items-center justify-center size-[200px] border border-gray-300 cursor-pointer"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children}
    </div>
  );
}
