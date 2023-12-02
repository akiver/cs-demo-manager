import { useContext } from 'react';
import { DialogContext } from './dialog-provider';

export function useDialog() {
  return useContext(DialogContext);
}
