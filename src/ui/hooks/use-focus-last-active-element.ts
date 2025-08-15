import { useRef } from 'react';

export function useFocusLastActiveElement() {
  const lastActiveElement = useRef<Element | null>(null);

  const updateElement = () => {
    lastActiveElement.current = document.activeElement;
  };

  const focusElement = () => {
    const elementToFocus = lastActiveElement.current;
    if (elementToFocus instanceof HTMLElement) {
      window.requestIdleCallback(() => {
        elementToFocus.focus();
        lastActiveElement.current = null;
      });
    }
  };

  return {
    updateElement,
    focusElement,
  };
}
