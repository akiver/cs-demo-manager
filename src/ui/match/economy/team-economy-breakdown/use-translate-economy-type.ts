import { useLingui } from '@lingui/react/macro';
import { EconomyType } from 'csdm/common/types/counter-strike';
import { assertNever } from 'csdm/common/assert-never';

export function useTranslateEconomyType() {
  const { t } = useLingui();

  const translateEconomyType = (type: EconomyType) => {
    switch (type) {
      case EconomyType.Pistol:
        return t({
          context: 'Economy type',
          message: 'Pistol',
        });
      case EconomyType.Eco:
        return t({
          context: 'Economy type',
          message: 'Eco',
        });
      case EconomyType.Semi:
        return t({
          context: 'Economy type',
          message: 'Semi buy',
        });
      case EconomyType.ForceBuy:
        return t({
          context: 'Economy type',
          message: 'Force buy',
        });
      case EconomyType.Full:
        return t({
          context: 'Economy type',
          message: 'Full buy',
        });
      default:
        assertNever(type, `Unknown economy type: ${type}`);
    }
  };

  return { translateEconomyType };
}
