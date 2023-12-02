import { useUiSettings } from './use-ui-settings';

export function useLocale() {
  const ui = useUiSettings();

  return ui.locale;
}
