import { DragIcon } from 'csdm/ui/icons/drag-icon';
import React from 'react';

type Props = {
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  width?: number;
  height?: number;
  src: string;
};

export function ImageDropZone({ onDrop, onClick, width, height, src }: Props) {
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      className="flex cursor-pointer items-center justify-center border border-gray-300"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ width: width ? `${width}px` : 200, height: height ? `${height}px` : 200 }}
    >
      {src ? <img src={src} className="size-full" /> : <DragIcon width={100} />}
    </div>
  );
}
