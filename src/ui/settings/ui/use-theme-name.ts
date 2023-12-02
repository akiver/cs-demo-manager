import { useUiSettings } from './use-ui-settings';

export function useThemeName() {
  const ui = useUiSettings();

  return ui.theme;
}
