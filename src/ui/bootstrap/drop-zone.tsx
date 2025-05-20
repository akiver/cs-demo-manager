import type { ReactNode } from 'react';
import React from 'react';
import { useNavigateToDemo } from 'csdm/ui/hooks/use-navigate-to-demo';

type Props = {
  children: ReactNode;
};

export function DropZone({ children }: Props) {
  const navigateToDemo = useNavigateToDemo();

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    for (const file of event.dataTransfer.files) {
      const path = window.csdm.getWebFilePath(file);
      if (path.endsWith('.dem')) {
        navigateToDemo(path);
        break;
      }
    }
  };

  return (
    <div onDragOver={onDragOver} onDrop={onDrop}>
      {children}
    </div>
  );
}
