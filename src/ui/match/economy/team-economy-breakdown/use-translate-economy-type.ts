import { msg } from '@lingui/macro';
import { EconomyType } from 'csdm/common/types/counter-strike';
import { assertNever } from 'csdm/common/assert-never';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useTranslateEconomyType() {
  const _ = useI18n();

  const translateEconomyType = (type: EconomyType) => {
    switch (type) {
      case EconomyType.Pistol:
        return _(
          msg({
            context: 'Economy type',
            message: 'Pistol',
          }),
        );
      case EconomyType.Eco:
        return _(
          msg({
            context: 'Economy type',
            message: 'Eco',
          }),
        );
      case EconomyType.Semi:
        return _(
          msg({
            context: 'Economy type',
            message: 'Semi buy',
          }),
        );
      case EconomyType.ForceBuy:
        return _(
          msg({
            context: 'Economy type',
            message: 'Force buy',
          }),
        );
      case EconomyType.Full:
        return _(
          msg({
            context: 'Economy type',
            message: 'Full buy',
          }),
        );
      default:
        assertNever(type, `Unknown economy type: ${type}`);
    }
  };

  return { translateEconomyType };
}
