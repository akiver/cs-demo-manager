import { useContext } from 'react';
import { ViewerContext } from './viewer-context';

export function useViewerContext() {
  const viewer = useContext(ViewerContext);

  if (viewer === undefined) {
    throw new Error('useViewerContext must be used within ViewerProvider');
  }

  return viewer;
}
