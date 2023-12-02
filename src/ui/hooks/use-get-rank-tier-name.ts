import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import { msg } from '@lingui/macro';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useGetRankTierName() {
  const _ = useI18n();

  return (tier: number) => {
    if (tier === CompetitiveRank.Unknown) {
      return _(
        msg({
          context: 'CS rank',
          message: `Not ranked`,
        }),
      );
    }

    return _(
      msg({
        context: 'CS premier rank tier',
        message: `Tier ${tier}`,
      }),
    );
  };
}
