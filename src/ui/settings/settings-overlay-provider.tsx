import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useTransition } from '@react-spring/web';
import type { ReactNode } from 'react';
import { SettingsOverlay } from './settings-overlay';
import { SettingsCategory } from './settings-category';
import { DialogProvider } from '../components/dialogs/dialog-provider';

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
  const [areSettingsVisible, setAreSettingsVisible] = useState(false);
  const [category, setCategory] = useState<SettingsCategory>(SettingsCategory.UI);
  const transitions = useTransition(areSettingsVisible, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
    leave: {
      opacity: 0,
    },
    config: {
      duration: 200,
    },
  });

  const showCategory = (category: SettingsCategory) => {
    setCategory(category);
  };

  const openSettings = useCallback((category?: SettingsCategory) => {
    if (category) {
      showCategory(category);
    }
    setAreSettingsVisible(true);
  }, []);

  const closeSettings = () => {
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
      setAreSettingsVisible(!areSettingsVisible);
    };

    const unListen = window.csdm.onToggleSettingsVisibility(toggleSettingsVisibility);

    return () => {
      unListen();
    };
  }, [areSettingsVisible]);

  useEffect(() => {
    const toggleSettingsVisibility = () => {
      openSettings(SettingsCategory.Analyze);
    };

    const unListen = window.csdm.onShowAbout(toggleSettingsVisibility);

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
      {transitions((style, isVisible) => {
        return isVisible ? (
          <DialogProvider>
            <SettingsOverlay style={style} onClose={closeSettings} />
          </DialogProvider>
        ) : null;
      })}
    </SettingsOverlayContext.Provider>
  );
}
