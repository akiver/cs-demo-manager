import { useRef } from 'react';
import { useFocusLock } from './use-focus-layers';

export function useFocusTrap() {
  const container = useRef<HTMLDivElement>(null);
  useFocusLock(container);

  return container;
}
