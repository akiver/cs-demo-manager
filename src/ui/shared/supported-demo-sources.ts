import { DemoSource, Game } from 'csdm/common/types/counter-strike';

export const SupportedDemoSourcesPerGame: Record<Game, DemoSource[]> = {
  [Game.CSGO]: [
    DemoSource.Challengermode,
    DemoSource.Ebot,
    DemoSource.Esea,
    DemoSource.Esl,
    DemoSource.FaceIt,
    DemoSource.Fastcup,
    DemoSource.FiveEPlay,
    DemoSource.PerfectWorld,
    DemoSource.Popflash,
    DemoSource.Valve,
  ],
  [Game.CS2]: [
    DemoSource.Challengermode,
    DemoSource.Ebot,
    DemoSource.Esl,
    DemoSource.FaceIt,
    DemoSource.Fastcup,
    DemoSource.FiveEPlay,
    DemoSource.PerfectWorld,
    DemoSource.Valve,
  ],
  [Game.CS2LT]: [DemoSource.Challengermode, DemoSource.FaceIt, DemoSource.Valve],
};
