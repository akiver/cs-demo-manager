import { msg } from '@lingui/macro';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useGetWinCountTranslation() {
  const _ = useI18n();

  return (winCount: number) => {
    return _(msg`Win count: ${winCount}`);
  };
}
