import { msg } from '@lingui/macro';
import { CompetitiveRank, type Rank } from 'csdm/common/types/counter-strike';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useGetRankName() {
  const _ = useI18n();

  return (rank: Rank) => {
    switch (rank) {
      case CompetitiveRank.SilverI:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Silver I',
          }),
        );
      case CompetitiveRank.SilverII:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Silver II',
          }),
        );
      case CompetitiveRank.SilverIII:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Silver III',
          }),
        );
      case CompetitiveRank.SilverIV:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Silver IV',
          }),
        );
      case CompetitiveRank.SilverElite:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Silver Elite',
          }),
        );
      case CompetitiveRank.SilverEliteMaster:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Silver Elite Master',
          }),
        );
      case CompetitiveRank.GoldNovaI:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Gold Nova I',
          }),
        );
      case CompetitiveRank.GoldNovaII:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Gold Nova II',
          }),
        );
      case CompetitiveRank.GoldNovaIII:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Gold Nova III',
          }),
        );
      case CompetitiveRank.GoldNovaMaster:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Gold Nova Master',
          }),
        );
      case CompetitiveRank.MasterGuardianI:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Master Guardian I',
          }),
        );
      case CompetitiveRank.MasterGuardianII:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Master Guardian II',
          }),
        );
      case CompetitiveRank.MasterGuardianElite:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Master Guardian Elite',
          }),
        );
      case CompetitiveRank.DistinguishedMasterGuardian:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Distinguished Master Guardian',
          }),
        );
      case CompetitiveRank.LegendaryEagle:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Legendary Eagle',
          }),
        );
      case CompetitiveRank.LegendaryEagleMaster:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Legendary Eagle Master',
          }),
        );
      case CompetitiveRank.SupremeMasterFirstClass:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'Supreme Master First Class',
          }),
        );
      case CompetitiveRank.GlobalElite:
        return _(
          msg({
            context: 'CS competitive rank',
            message: 'The Global Elite',
          }),
        );
      case CompetitiveRank.Unknown:
      default:
        return _(
          msg({
            context: 'CS rank',
            message: 'Not ranked',
          }),
        );
    }
  };
}
