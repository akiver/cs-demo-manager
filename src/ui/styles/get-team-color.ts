import { TeamNumber } from 'csdm/common/types/counter-strike';

export function getTeamColor(teamNumber: TeamNumber) {
  return teamNumber === TeamNumber.CT ? '#378ef0' : '#f29423';
}
