import { DemoSource, SupportedDemoSources, Game } from 'csdm/common/types/counter-strike';

export const SupportedDemoSourcesPerGame: Record<Game, DemoSource[]> = {
  [Game.CSGO]: SupportedDemoSources,
  [Game.CS2]: [DemoSource.Valve, DemoSource.FaceIt, DemoSource.Ebot, DemoSource.Esl],
  [Game.CS2LT]: [DemoSource.Valve, DemoSource.FaceIt],
};
