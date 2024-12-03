import { useLingui } from '@lingui/react/macro';
import { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';

export function useTranslateEconomyBan() {
  const { t } = useLingui();

  return (ban: EconomyBan) => {
    switch (ban) {
      case EconomyBan.None:
        return t({
          context: 'Steam economy ban status',
          message: 'None',
        });
      case EconomyBan.Probation:
        return t({
          context: 'Steam economy ban status',
          message: 'Probation',
        });
      case EconomyBan.Banned:
        return t({
          context: 'Steam economy ban status',
          message: 'Banned',
        });
      default:
        return t({
          context: 'Steam economy ban status',
          message: 'Unknown',
        });
    }
  };
}
