import { useSyncExternalStore } from 'react';
import { getCssVariableValue } from '../shared/get-css-variable-value';

export function useCssVariableValue(variableName: string) {
  const subscribe = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    // Listen for theme changes by observing the class of the html root element.
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  };

  const getSnapshot = () => {
    return getCssVariableValue(variableName);
  };

  const variable = useSyncExternalStore(subscribe, getSnapshot);

  return variable;
}
