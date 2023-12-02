import { createContext } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'info' | 'success' | 'error' | 'warning';

export type Toast = {
  id: string;
  content: ReactNode;
  type?: ToastType;
  onClick?: () => void;
};

export type ShowToastOptions = Omit<Toast, 'id'> & {
  id?: string;
};

type ToastsContextState = (options: ShowToastOptions) => void;

export const ToastsContext = createContext<ToastsContextState>(() => {
  throw new Error('showToast not implemented');
});
