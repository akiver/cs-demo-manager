import { useLingui } from '@lingui/react/macro';
import { CompetitiveRank, type Rank } from 'csdm/common/types/counter-strike';

export function useGetRankName() {
  const { t } = useLingui();

  return (rank: Rank) => {
    switch (rank) {
      case CompetitiveRank.SilverI:
        return t({
          context: 'CS competitive rank',
          message: 'Silver I',
        });
      case CompetitiveRank.SilverII:
        return t({
          context: 'CS competitive rank',
          message: 'Silver II',
        });
      case CompetitiveRank.SilverIII:
        return t({
          context: 'CS competitive rank',
          message: 'Silver III',
        });
      case CompetitiveRank.SilverIV:
        return t({
          context: 'CS competitive rank',
          message: 'Silver IV',
        });
      case CompetitiveRank.SilverElite:
        return t({
          context: 'CS competitive rank',
          message: 'Silver Elite',
        });
      case CompetitiveRank.SilverEliteMaster:
        return t({
          context: 'CS competitive rank',
          message: 'Silver Elite Master',
        });
      case CompetitiveRank.GoldNovaI:
        return t({
          context: 'CS competitive rank',
          message: 'Gold Nova I',
        });
      case CompetitiveRank.GoldNovaII:
        return t({
          context: 'CS competitive rank',
          message: 'Gold Nova II',
        });
      case CompetitiveRank.GoldNovaIII:
        return t({
          context: 'CS competitive rank',
          message: 'Gold Nova III',
        });
      case CompetitiveRank.GoldNovaMaster:
        return t({
          context: 'CS competitive rank',
          message: 'Gold Nova Master',
        });
      case CompetitiveRank.MasterGuardianI:
        return t({
          context: 'CS competitive rank',
          message: 'Master Guardian I',
        });
      case CompetitiveRank.MasterGuardianII:
        return t({
          context: 'CS competitive rank',
          message: 'Master Guardian II',
        });
      case CompetitiveRank.MasterGuardianElite:
        return t({
          context: 'CS competitive rank',
          message: 'Master Guardian Elite',
        });
      case CompetitiveRank.DistinguishedMasterGuardian:
        return t({
          context: 'CS competitive rank',
          message: 'Distinguished Master Guardian',
        });
      case CompetitiveRank.LegendaryEagle:
        return t({
          context: 'CS competitive rank',
          message: 'Legendary Eagle',
        });
      case CompetitiveRank.LegendaryEagleMaster:
        return t({
          context: 'CS competitive rank',
          message: 'Legendary Eagle Master',
        });
      case CompetitiveRank.SupremeMasterFirstClass:
        return t({
          context: 'CS competitive rank',
          message: 'Supreme Master First Class',
        });
      case CompetitiveRank.GlobalElite:
        return t({
          context: 'CS competitive rank',
          message: 'The Global Elite',
        });
      case CompetitiveRank.Unknown:
      default:
        return t({
          context: 'CS rank',
          message: 'Not ranked',
        });
    }
  };
}
