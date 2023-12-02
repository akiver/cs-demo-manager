import { useEffect, useRef } from 'react';

type Callback = (event: MouseEvent) => void;

export function useOutsideClick<ElementType extends HTMLElement>(callback: Callback) {
  const ref = useRef<ElementType>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        callback(event);
      }
    };

    window.addEventListener('click', onClick, true);

    return () => {
      window.removeEventListener('click', onClick, true);
    };
  }, [ref, callback]);

  return ref;
}
