import { msg } from '@lingui/macro';
import { useI18n } from './use-i18n';
import { assertNever } from 'csdm/common/assert-never';
import { TeamNumber } from 'csdm/common/types/counter-strike';

export function useTranslateTeamNumber() {
  const _ = useI18n();

  return (teamNumber: TeamNumber) => {
    switch (teamNumber) {
      case TeamNumber.CT:
        return _(
          msg({
            context: 'Team side',
            message: 'CT',
          }),
        );
      case TeamNumber.T:
        return _(
          msg({
            context: 'Team side',
            message: 'T',
          }),
        );
      case TeamNumber.SPECTATOR:
        return _(
          msg({
            context: 'Team side',
            message: 'SPEC',
          }),
        );
      case TeamNumber.UNASSIGNED:
        return _(
          msg({
            context: 'Team side',
            message: 'Unassigned',
          }),
        );
      default:
        return assertNever(teamNumber, 'Unknown team number');
    }
  };
}
