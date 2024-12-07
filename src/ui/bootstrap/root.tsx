import React, { StrictMode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MotionConfig } from 'motion/react';
import { store } from 'csdm/ui/store/store';
import { AppLoader } from 'csdm/ui/bootstrap/app-loader';
import { LocaleProvider } from 'csdm/ui/bootstrap/locale-provider';
import { TitleBar } from 'csdm/ui/title-bar/title-bar';
import { ArgumentsProvider } from 'csdm/ui/bootstrap/arguments-provider';
import { SettingsProvider } from 'csdm/ui/bootstrap/settings-provider';
import { WebSocketProvider } from 'csdm/ui/bootstrap/web-socket-provider';
import { DatabaseLoader } from 'csdm/ui/bootstrap/database-loader';
import { DialogProvider } from 'csdm/ui/components/dialogs/dialog-provider';
import { ToastsProvider } from 'csdm/ui/components/toasts/toasts-provider';
import { SettingsOverlayProvider } from 'csdm/ui/settings/settings-overlay-provider';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';

function App() {
  return (
    <ReduxProvider store={store}>
      <MotionConfig reducedMotion="user">
        <LocaleProvider>
          <TitleBar />
          <ArgumentsProvider>
            <ToastsProvider>
              <SettingsProvider>
                <WebSocketProvider>
                  <DialogProvider inertElementId={APP_ELEMENT_ID}>
                    <DatabaseLoader>
                      <SettingsOverlayProvider>
                        <AppLoader />
                      </SettingsOverlayProvider>
                    </DatabaseLoader>
                  </DialogProvider>
                </WebSocketProvider>
              </SettingsProvider>
            </ToastsProvider>
          </ArgumentsProvider>
        </LocaleProvider>
      </MotionConfig>
    </ReduxProvider>
  );
}

export function Root() {
  if (REACT_STRICT_MODE_ENABLED) {
    return (
      <StrictMode>
        <App />
      </StrictMode>
    );
  }

  return <App />;
}
