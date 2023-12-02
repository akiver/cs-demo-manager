globalThis.logger = window.csdm.logger;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { onWindowError } from 'csdm/common/on-window-error';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeName } from '../common/types/theme-name';
import { isSelectAllKeyboardEvent } from './keyboard/keyboard';
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

const container = document.getElementById('app') as HTMLDivElement;
const root = ReactDOM.createRoot(container);
root.render(<RouterProvider router={router} />);
