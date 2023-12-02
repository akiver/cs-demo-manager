import { useI18n } from './use-i18n';

export function useBooleanHuman() {
  const _ = useI18n();

  return (bool: boolean) => {
    return bool ? _({ id: 'yes', message: 'Yes' }) : _({ id: 'no', message: 'No' });
  };
}
