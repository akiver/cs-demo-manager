import { useLingui } from '@lingui/react/macro';

export function useGetWinCountTranslation() {
  const { t } = useLingui();

  return (winCount: number) => {
    return t`Win count: ${winCount}`;
  };
}
