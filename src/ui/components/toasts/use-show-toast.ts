import { useContext } from 'react';
import { ToastsContext } from './toasts-context';

export function useShowToast() {
  return useContext(ToastsContext);
}
