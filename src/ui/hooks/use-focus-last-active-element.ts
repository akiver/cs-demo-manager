import { useCallback, useRef } from 'react';

export function useFocusLastActiveElement() {
  const lastActiveElement = useRef<Element | null>(null);

  const updateElement = useCallback(() => {
    lastActiveElement.current = document.activeElement;
  }, []);

  const focusElement = useCallback(() => {
    const elementToFocus = lastActiveElement.current;
    if (elementToFocus instanceof HTMLElement) {
      window.requestIdleCallback(() => {
        elementToFocus.focus();
        lastActiveElement.current = null;
      });
    }
  }, []);

  return {
    updateElement,
    focusElement,
  };
}
