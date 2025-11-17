import { Game } from 'csdm/common/types/counter-strike';
import type { SelectOption } from '../components/inputs/select';
import { getGameName } from '../shared/get-game-name';

type Options = {
  includeCs2LimitedTest?: boolean;
};

export function useGameOptions({ includeCs2LimitedTest }: Options = { includeCs2LimitedTest: true }) {
  const options: SelectOption<Game>[] = [Game.CS2, Game.CSGO].map((game) => ({
    value: game,
    label: getGameName(game),
  }));

  if (includeCs2LimitedTest) {
    options.push({
      value: Game.CS2LT,
      label: getGameName(Game.CS2LT),
    });
  }

  return options;
}
