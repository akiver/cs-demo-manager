globalThis.logger = window.csdm.logger;
document.title = 'CS Demo Manager';
import React, { type ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { onWindowError } from 'csdm/common/on-window-error';
import { router } from 'csdm/ui/router';
import { ThemeName } from 'csdm/common/types/theme-name';
import { isSelectAllKeyboardEvent } from 'csdm/ui/keyboard/keyboard';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';
import './index.css';

window.addEventListener('error', onWindowError);
window.addEventListener('unhandledrejection', (error) => {
  logger.error(error);
  if (error.reason.stack) {
    logger.error(error.reason.stack);
  }
});
window.addEventListener('keydown', (event) => {
  if (
    isSelectAllKeyboardEvent(event) &&
    !(event.target instanceof HTMLInputElement) &&
    !(event.target instanceof HTMLTextAreaElement)
  ) {
    event.preventDefault();
  }
});

async function updateThemeClassName() {
  const theme = await window.csdm.getTheme();
  if (theme === ThemeName.Light) {
    document.documentElement.classList.remove('dark');
  }
}

updateThemeClassName();

function onError(error: unknown, errorInfo: ErrorInfo) {
  logger.error(error);
  if (error instanceof Error && typeof error.stack === 'string') {
    logger.error(error.stack);
  }
  logger.error(errorInfo.componentStack);
}

const container = document.getElementById(APP_ELEMENT_ID) as HTMLDivElement;
const root = ReactDOM.createRoot(container, {
  onCaughtError: onError,
  onUncaughtError: onError,
});
root.render(<RouterProvider router={router} />);
