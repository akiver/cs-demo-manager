import { useContext } from 'react';
import type { SettingsOverlay } from './settings-overlay-provider';
import { SettingsOverlayContext } from './settings-overlay-provider';

export function useSettingsOverlay(): SettingsOverlay {
  const settingsOverlay = useContext(SettingsOverlayContext);

  return settingsOverlay;
}
