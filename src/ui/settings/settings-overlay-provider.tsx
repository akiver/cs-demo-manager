import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { SettingsOverlay } from './settings-overlay';
import { SettingsCategory } from './settings-category';
import { DialogProvider } from '../components/dialogs/dialog-provider';
import { makeElementInert, makeElementNonInert } from 'csdm/ui/shared/inert';
import { useFocusLastActiveElement } from 'csdm/ui/hooks/use-focus-last-active-element';
import { APP_ELEMENT_ID, SETTINGS_ELEMENT_ID } from 'csdm/ui/shared/element-ids';

export type SettingsOverlay = {
  category: SettingsCategory;
  openSettings: (category?: SettingsCategory) => void;
  showCategory: (category: SettingsCategory) => void;
  closeSettings: () => void;
};

export const SettingsOverlayContext = createContext<SettingsOverlay>({
  category: SettingsCategory.Folders,
  openSettings: () => {
    throw new Error(
      'openSettings not implemented, make sure your component is rendered within a SettingsOverlayProvider',
    );
  },
  showCategory: () => {
    throw new Error(
      'showCategory not implemented, make sure your component is rendered within a SettingsOverlayProvider',
    );
  },
  closeSettings: () => {
    throw new Error(
      'closeSettings not implemented, make sure your component is rendered within a SettingsOverlayProvider',
    );
  },
});

type Props = {
  children: ReactNode;
};

export function SettingsOverlayProvider({ children }: Props) {
  const { focusElement, updateElement } = useFocusLastActiveElement();
  const [areSettingsVisible, setAreSettingsVisible] = useState(false);
  const [category, setCategory] = useState<SettingsCategory>(SettingsCategory.UI);

  const showCategory = (category: SettingsCategory) => {
    setCategory(category);
  };

  // https://github.com/reactwg/react-compiler/discussions/18
  // eslint-disable-next-line react-hooks/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openSettings = (category?: SettingsCategory) => {
    if (category) {
      showCategory(category);
    }
    updateElement();
    makeElementInert(APP_ELEMENT_ID);
    setAreSettingsVisible(true);
  };

  // https://github.com/reactwg/react-compiler/discussions/18
  // eslint-disable-next-line react-hooks/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const closeSettings = () => {
    makeElementNonInert(APP_ELEMENT_ID);
    focusElement();
    setAreSettingsVisible(false);
  };

  useEffect(() => {
    const onOpenSettings = () => {
      openSettings();
    };

    const unListen = window.csdm.onOpenSettings(onOpenSettings);

    return () => {
      unListen();
    };
  }, [openSettings]);

  useEffect(() => {
    const toggleSettingsVisibility = () => {
      if (areSettingsVisible) {
        closeSettings();
      } else {
        openSettings();
      }
    };

    const unListen = window.csdm.onToggleSettingsVisibility(toggleSettingsVisibility);

    return () => {
      unListen();
    };
  }, [openSettings, closeSettings, areSettingsVisible]);

  useEffect(() => {
    const showAbout = () => {
      openSettings(SettingsCategory.About);
    };

    const unListen = window.csdm.onShowAbout(showAbout);

    return () => {
      unListen();
    };
  }, [openSettings]);

  return (
    <SettingsOverlayContext.Provider
      value={{
        category,
        showCategory,
        openSettings,
        closeSettings,
      }}
    >
      {children}
      {areSettingsVisible ? (
        <DialogProvider inertElementId={SETTINGS_ELEMENT_ID}>
          <SettingsOverlay onClose={closeSettings} />
        </DialogProvider>
      ) : null}
    </SettingsOverlayContext.Provider>
  );
}
