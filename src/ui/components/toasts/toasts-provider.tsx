import React, { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Toast, ShowToastOptions } from './toasts-context';
import { ToastsContext } from './toasts-context';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { CheckCircleIcon } from 'csdm/ui/icons/check-circle-icon';
import { TimesCircleIcon } from 'csdm/ui/icons/times-circle';

type Timeout = { id: number; startedAt: number; msRemaining: number };

type Props = {
  children: ReactNode;
};

export function ToastsProvider({ children }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<string, Timeout>>(new Map());

  const showToast = (options: ShowToastOptions) => {
    const toastId = options.id ?? window.crypto.randomUUID();
    const timeoutId = timeouts.current.get(toastId)?.id;
    window.clearTimeout(timeoutId);

    const durationInMs = 5000;
    timeouts.current.set(toastId, {
      id: window.setTimeout(() => {
        removeToast(toastId);
      }, durationInMs),
      startedAt: Date.now(),
      msRemaining: durationInMs,
    });

    const isToastAlreadyExists = timeoutId !== undefined || toasts.some((toast) => toast.id === toastId);
    if (isToastAlreadyExists) {
      setToasts((toasts) => {
        return toasts.map((toast) => {
          if (toast.id === toastId) {
            return { ...options, id: toastId };
          }

          return toast;
        });
      });
    } else {
      setToasts((toasts) => {
        return [
          ...toasts,
          {
            ...options,
            id: toastId,
          },
        ];
      });
    }
  };

  const removeToast = (toastId: string) => {
    window.clearTimeout(timeouts.current.get(toastId)?.id);
    timeouts.current.delete(toastId);

    setToasts((toasts) => {
      return toasts.filter((toast) => toast.id !== toastId);
    });
  };

  return (
    <ToastsContext.Provider value={showToast}>
      {children}
      <div className="absolute z-3 right-24 top-48 flex flex-col gap-y-8 max-w-[448px]">
        <AnimatePresence>
          {toasts.map((toast) => {
            const renderContent = () => {
              let icon: ReactNode = null;
              switch (toast.type) {
                case 'success':
                  icon = <CheckCircleIcon className="size-24 mr-8 text-green-500 self-center" />;
                  break;
                case 'error':
                  icon = <TimesCircleIcon className="size-24 mr-8 text-red-500 self-center" />;
                  break;
                case 'warning':
                  icon = <ExclamationTriangleIcon className="size-24 mr-8 text-orange-500 self-center" />;
                  break;
              }

              return (
                <div className="flex items-center">
                  {icon}
                  <div className="flex-1 select-none">{toast.content}</div>
                </div>
              );
            };

            return (
              <motion.div
                key={toast.id}
                className="flex p-16 bg-gray-75 text-gray-900 border-2 border-gray-300 rounded-8 ml-auto min-w-[300px]"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                role="alert"
                onMouseEnter={() => {
                  const timeout = timeouts.current.get(toast.id);
                  if (!timeout) {
                    return;
                  }

                  timeout.msRemaining -= Date.now() - timeout.startedAt;
                  window.clearTimeout(timeout.id);
                }}
                onMouseLeave={() => {
                  const timeout = timeouts.current.get(toast.id);
                  if (!timeout) {
                    return;
                  }

                  timeouts.current.set(toast.id, {
                    id: window.setTimeout(() => {
                      removeToast(toast.id);
                    }, timeout.msRemaining),
                    startedAt: Date.now(),
                    msRemaining: timeout.msRemaining,
                  });
                }}
                onClick={() => {
                  toast.onClick?.();
                  removeToast(toast.id);
                }}
              >
                {renderContent()}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastsContext.Provider>
  );
}
