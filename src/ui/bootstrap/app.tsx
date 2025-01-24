import React, { useEffect } from 'react';
import { LeftBar } from 'csdm/ui/left-bar/left-bar';
import { AppWrapper } from './app-wrapper';
import { AppContent } from './app-content';
import { NavigationListener } from './navigation-listener';
import { DropZone } from './drop-zone';
import { ContextMenuProvider } from '../components/context-menu/context-menu-provider';
import { useArgumentsContext } from './use-arguments-context';
import { Outlet } from 'react-router';
import { useDialog } from '../components/dialogs/use-dialog';
import { ChangelogDialog } from '../changelog/changelog-dialog';

export function App() {
  const { clearArguments } = useArgumentsContext();
  const { showDialog } = useDialog();

  useEffect(() => {
    // The app has been renderer, we can now clear startup arguments so that they will be ignored when
    // reloading the window.
    clearArguments();
  }, [clearArguments]);

  useEffect(() => {
    (async () => {
      if (await window.csdm.shouldShowChangelog()) {
        showDialog(<ChangelogDialog />);
      }
    })();
  }, [showDialog]);

  return (
    <NavigationListener>
      <DropZone>
        <ContextMenuProvider>
          <AppWrapper>
            <LeftBar />
            <AppContent>
              <Outlet />
            </AppContent>
          </AppWrapper>
        </ContextMenuProvider>
      </DropZone>
    </NavigationListener>
  );
}
