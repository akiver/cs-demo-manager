import { useContext } from 'react';
import { FullscreenContext } from './fullscreen-provider';

export function useFullscreen() {
  return useContext(FullscreenContext);
}
