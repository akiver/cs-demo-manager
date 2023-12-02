import { useContext } from 'react';
import { ArgumentsContext } from './arguments-provider';

export function useArgumentsContext() {
  const context = useContext(ArgumentsContext);

  return context;
}
