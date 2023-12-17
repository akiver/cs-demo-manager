globalThis.logger = window.csdm.logger;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { onWindowError } from 'csdm/common/on-window-error';
import { router } from 'csdm/ui/router';
import { ThemeName } from 'csdm/common/types/theme-name';
import { isSelectAllKeyboardEvent } from 'csdm/ui/keyboard/keyboard';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';
import './index.css';

window.addEventListener('error', onWindowError);
window.addEventListener('unhandledrejection', logger.error);
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

const container = document.getElementById(APP_ELEMENT_ID) as HTMLDivElement;
const root = ReactDOM.createRoot(container);
root.render(<RouterProvider router={router} />);
