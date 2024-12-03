import { useLingui } from '@lingui/react/macro';
import { assertNever } from 'csdm/common/assert-never';
import { TeamNumber } from 'csdm/common/types/counter-strike';

export function useTranslateTeamNumber() {
  const { t } = useLingui();

  return (teamNumber: TeamNumber) => {
    switch (teamNumber) {
      case TeamNumber.CT:
        return t({
          context: 'Team side',
          message: 'CT',
        });
      case TeamNumber.T:
        return t({
          context: 'Team side',
          message: 'T',
        });
      case TeamNumber.SPECTATOR:
        return t({
          context: 'Team side',
          message: 'SPEC',
        });
      case TeamNumber.UNASSIGNED:
        return t({
          context: 'Team side',
          message: 'Unassigned',
        });
      default:
        return assertNever(teamNumber, 'Unknown team number');
    }
  };
}
