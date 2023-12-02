import { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';
import { useI18n } from './use-i18n';
import { msg } from '@lingui/macro';

export function useTranslateEconomyBan() {
  const _ = useI18n();

  return (ban: EconomyBan) => {
    switch (ban) {
      case EconomyBan.None:
        return _(
          msg({
            context: 'Steam economy ban status',
            message: 'None',
          }),
        );
      case EconomyBan.Probation:
        return _(
          msg({
            context: 'Steam economy ban status',
            message: 'Probation',
          }),
        );
      case EconomyBan.Banned:
        return _(
          msg({
            context: 'Steam economy ban status',
            message: 'Banned',
          }),
        );
      default:
        return _(
          msg({
            context: 'Steam economy ban status',
            message: 'Unknown',
          }),
        );
    }
  };
}
