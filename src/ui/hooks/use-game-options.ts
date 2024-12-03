import { Game } from 'csdm/common/types/counter-strike';
import type { SelectOption } from '../components/inputs/select';

type Options = {
  includeCs2LimitedTest?: boolean;
};

export function useGameOptions({ includeCs2LimitedTest }: Options = { includeCs2LimitedTest: true }) {
  /* eslint-disable lingui/no-unlocalized-strings */
  const options: SelectOption<Game>[] = [
    {
      value: Game.CS2,
      label: 'CS2',
    },
    {
      value: Game.CSGO,
      label: 'CS:GO',
    },
  ];

  if (includeCs2LimitedTest) {
    options.push({
      value: Game.CS2LT,
      label: 'CS2 Limited Test',
    });
  }
  /* eslint-enable lingui/no-unlocalized-strings */

  return options;
}
